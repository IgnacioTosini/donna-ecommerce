import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import ts from 'typescript';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ quiet: true });
const dependency = createRequire(import.meta.url);
const db = new PrismaClient();
function loadModules() {
    const loaded = new Map();
    function load(file) {
        const filename = path.resolve(file);
        if (loaded.has(filename)) return loaded.get(filename).exports;
        const entry = { exports: {} }; loaded.set(filename, entry);
        const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
        const resolver = id => {
            if (id === '@/lib/prisma') return { prisma: db };
            if (id === '@/lib/admin-session') return { isAdminAuthenticated: async () => true };
            if (id === 'next/cache') return { updateTag() {}, revalidatePath() {} };
            if (id.startsWith('@/')) return load(`src/${id.slice(2)}.ts`);
            if (id.startsWith('.')) return load(path.resolve(path.dirname(filename), `${id}.ts`));
            return dependency(id);
        };
        new Function('require', 'module', 'exports', code)(resolver, entry, entry.exports);
        return entry.exports;
    }
    return load;
}

test('shopping stock flow against local PostgreSQL', async t => {
    const url = new URL(process.env.DATABASE_URL);
    assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname), 'This test only runs on a local database');
    const tag = `test-shopping-${randomUUID()}`;
    const load = loadModules();
    const actions = load('src/app/actions/utils/orders.ts');
    const category = await db.category.create({ data: { name: tag, slug: tag } });
    let size;
    try {
        const product = await db.product.create({ data: {
            name: tag, slug: tag, categoryId: category.id, price: 100, active: true,
            sizeGuide: 'Talle M: pecho 100 cm. Medir el contorno.',
            variants: { create: { colorHex: '#000000', sizes: { create: { size: 'M', stock: 10 } } } },
        }, include: { variants: { include: { sizes: true } } } });
        size = product.variants[0].sizes[0];
        const input = quantity => ({ customerName: tag, phone: '+5493511234567', items: [{ variantId: size.variantId, productSizeStockId: size.id, quantity }] });
        const stock = async () => (await db.productSizeStock.findUniqueOrThrow({ where: { id: size.id } })).stock;
        await t.test('size guide persists with product', async () => {
            assert.equal((await db.product.findUniqueOrThrow({ where: { id: product.id } })).sizeGuide, product.sizeGuide);
        });
        await t.test('pending does not reserve; duplicate confirmation/cancellation is idempotent', async () => {
            const result = await actions.createOrderAction(input(3));
            assert.equal(result.ok, true);
            assert.equal(await stock(), 10);
            const confirms = await Promise.all([actions.updateOrderStatusByIdAction(result.order.id, 'CONFIRMED'), actions.updateOrderStatusByIdAction(result.order.id, 'CONFIRMED')]);
            assert.ok(confirms.every(r => r.ok));
            assert.equal(await stock(), 7);
            const cancels = await Promise.all([actions.updateOrderStatusByIdAction(result.order.id, 'CANCELLED'), actions.updateOrderStatusByIdAction(result.order.id, 'CANCELLED')]);
            assert.ok(cancels.every(r => r.ok));
            assert.equal(await stock(), 10);
            assert.equal((await actions.updateOrderStatusByIdAction(result.order.id, 'PENDING')).ok, true);
            assert.equal(await stock(), 10);
        });
        await t.test('concurrent different orders cannot oversell', async () => {
            const a = await actions.createOrderAction(input(8));
            const b = await actions.createOrderAction(input(8));
            assert.ok(a.ok && b.ok);
            const results = await Promise.all([actions.updateOrderStatusByIdAction(a.order.id, 'CONFIRMED'), actions.updateOrderStatusByIdAction(b.order.id, 'CONFIRMED')]);
            assert.equal(results.filter(r => r.ok).length, 1);
            assert.equal(await stock(), 2);
            const winner = results[0].ok ? a : b;
            await actions.updateOrderStatusByIdAction(winner.order.id, 'CANCELLED');
            assert.equal(await stock(), 10);
        });
        await t.test('legacy reservation is not deducted twice', async () => {
            const result = await actions.createOrderAction(input(2));
            await db.$transaction([
                db.productSizeStock.update({ where: { id: size.id }, data: { stock: { decrement: 2 } } }),
                db.order.update({ where: { id: result.order.id }, data: { stockDeducted: true } }),
            ]);
            assert.equal((await actions.updateOrderStatusByIdAction(result.order.id, 'CONFIRMED')).ok, true);
            assert.equal(await stock(), 8);
            await actions.updateOrderStatusByIdAction(result.order.id, 'CANCELLED');
            assert.equal(await stock(), 10);
        });
        await t.test('invalid transitions and deletion do not restore shipped stock', async () => {
            const result = await actions.createOrderAction(input(1));
            assert.equal((await actions.updateOrderStatusByIdAction(result.order.id, 'DELIVERED')).ok, false);
            await actions.updateOrderStatusByIdAction(result.order.id, 'CONFIRMED');
            await actions.updateOrderStatusByIdAction(result.order.id, 'SHIPPED');
            assert.equal((await actions.updateOrderStatusByIdAction(result.order.id, 'CANCELLED')).ok, false);
            const form = new FormData(); form.set('orderId', result.order.id);
            assert.equal((await actions.deleteOrderAction(form)).ok, false);
            assert.equal(await stock(), 9);
        });
        await t.test('invalid quantities return a controlled error', async () => {
            assert.equal((await actions.createOrderAction(input(-1))).ok, false);
            assert.equal((await actions.createOrderAction(input(0))).ok, false);
        });
        await t.test('date filters include the full local day and contacts require country code', () => {
            const { matchesOrderFilters, customerWhatsappUrl } = load('src/lib/order-filters.ts');
            const order = { status: 'PENDING', createdAt: '2026-09-09T02:59:59Z' };
            assert.equal(matchesOrderFilters(order, 'PENDING', '2026-09-08', '2026-09-08'), true);
            assert.equal(matchesOrderFilters(order, 'CONFIRMED', '', ''), false);
            assert.equal(matchesOrderFilters(order, '', '2026-09-09', ''), false);
            assert.equal(customerWhatsappUrl('3511234567', 'abc'), null);
            assert.match(customerWhatsappUrl('+54 9 351 1234567', 'abc'), /^https:\/\/wa.me\/5493511234567\?/);
        });
    } finally {
        // Only fixtures from this run, identified by their unique customer/category.
        await db.order.deleteMany({ where: { customerName: tag } });
        await db.product.deleteMany({ where: { categoryId: category.id } });
        await db.category.delete({ where: { id: category.id } });
        await db.$disconnect();
    }
});
