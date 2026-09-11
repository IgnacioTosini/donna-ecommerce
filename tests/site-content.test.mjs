import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';
const loadDependency = createRequire(import.meta.url);

// Run the actual server modules against an isolated repository/cache adapter.
// No production database, cookies or published content are touched.
function fixture() {
    const rows = new Map();
    const invalidations = [];
    let authenticated = true;
    const prisma = { siteContent: {
        findMany: async () => structuredClone([...rows.values()]),
        findUnique: async ({ where }) => structuredClone(rows.get(where.id) ?? null),
        upsert: async ({ where, create }) => {
            if (!rows.has(where.id)) rows.set(where.id, { ...structuredClone(create), version: 0, publishedAt: null });
            return structuredClone(rows.get(where.id));
        },
        updateMany: async ({ where, data }) => {
            const row = rows.get(where.id);
            if (!row || row.version !== where.version) return { count: 0 };
            Object.assign(row, structuredClone(data), { version: row.version + data.version.increment });
            return { count: 1 };
        },
    } };
    const modules = new Map();
    function load(file) {
        const absolute = path.resolve(file);
        if (modules.has(absolute)) return modules.get(absolute).exports;
        const loaded = { exports: {} }; modules.set(absolute, loaded);
        const code = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
        }).outputText;
        const localRequire = id => {
            if (id === 'server-only') return {};
            if (id.endsWith('/prisma') || id === './prisma') return { prisma };
            if (id.endsWith('/admin-session') || id === './admin-session') return { isAdminAuthenticated: async () => authenticated };
            if (id === 'next/cache') return {
                unstable_cache: fn => fn,
                updateTag: tag => invalidations.push(['tag', tag]),
                revalidatePath: (...args) => invalidations.push(['path', ...args]),
            };
            if (id.startsWith('@/')) return load(`src/${id.slice(2)}.ts`);
            if (id.startsWith('.')) return load(path.resolve(path.dirname(absolute), `${id}.ts`));
            return loadDependency(id);
        };
        new Function('require', 'module', 'exports', code)(localRequire, loaded, loaded.exports);
        return loaded.exports;
    }
    return {
        actions: load('src/app/actions/site-content.action.ts'),
        content: load('src/lib/site-content.ts'),
        schema: load('src/lib/site-content-schema.ts'),
        invalidations, rows,
        deny: () => { authenticated = false; },
    };
}

test('first public visit uses Donna defaults without inserting data', async () => {
    const f = fixture();
    const data = await f.content.getPublishedContent();
    assert.equal(data.business.instagramUsername, 'donna_rio');
    assert.equal(data.home.featured.count, 4);
    assert.equal(f.rows.size, 0);
});

test('saving a draft changes the preview but not the public home or cache', async () => {
    const f = fixture();
    const editor = await f.content.getContentEditor('home');
    editor.draft.editorial.title = 'Nuevo título del borrador';
    assert.equal((await f.actions.saveContentDraft({ key: 'home', version: 0 }, editor.draft)).ok, true);
    assert.equal((await f.content.getPreviewContent()).home.editorial.title, 'Nuevo título del borrador');
    assert.notEqual((await f.content.getPublishedContent()).home.editorial.title, 'Nuevo título del borrador');
    assert.deepEqual(f.invalidations, []);
});

test('publishing promotes only the selected draft and expires public content', async () => {
    const f = fixture();
    const home = await f.content.getContentEditor('home');
    const business = await f.content.getContentEditor('business');
    home.draft.editorial.visible = false;
    business.draft.openingHours = '10:00 a 18:00';
    await f.actions.saveContentDraft({ key: 'home', version: 0 }, home.draft);
    await f.actions.saveContentDraft({ key: 'business', version: 0 }, business.draft);
    const published = await f.actions.publishContent({ key: 'business', version: 1 });
    assert.equal(published.ok, true);
    assert.ok(published.publishedAt);
    const data = await f.content.getPublishedContent();
    assert.equal(data.business.openingHours, '10:00 a 18:00');
    assert.equal(data.home.editorial.visible, true);
    assert.deepEqual(f.invalidations, [['tag', 'site-content'], ['path', '/', 'layout']]);
});

test('stale tabs cannot overwrite or publish a newer draft', async () => {
    const f = fixture();
    const editor = await f.content.getContentEditor('home');
    const result = await f.actions.saveContentDraft({ key: 'home', version: 0 }, editor.draft);
    assert.equal(result.version, 1);
    assert.equal((await f.actions.saveContentDraft({ key: 'home', version: 0 }, editor.draft)).ok, false);
    assert.equal((await f.actions.publishContent({ key: 'home', version: 0 })).ok, false);
    assert.deepEqual(f.invalidations, []);
});

test('two concurrent saves accept only one version', async () => {
    const f = fixture();
    const { draft } = await f.content.getContentEditor('home');
    const results = await Promise.all([
        f.actions.saveContentDraft({ key: 'home', version: 0 }, draft),
        f.actions.saveContentDraft({ key: 'home', version: 0 }, draft),
    ]);
    assert.equal(results.filter(r => r.ok).length, 1);
});

test('anonymous access cannot read drafts, save or publish', async () => {
    const f = fixture(); f.deny();
    await assert.rejects(f.content.getContentEditor('home'), /No autorizado/);
    await assert.rejects(f.content.getPreviewContent(), /No autorizado/);
    await assert.rejects(f.actions.saveContentDraft({ key: 'home', version: 0 }, {}), /No autorizado/);
    await assert.rejects(f.actions.publishContent({ key: 'home', version: 0 }), /No autorizado/);
    assert.equal(f.rows.size, 0);
});

test('unsafe button URLs, unsupported images and invalid counts cannot be saved', async () => {
    const f = fixture();
    const { draft } = await f.content.getContentEditor('home');
    for (const url of ['javascript:alert(1)', '//evil.example', '/\\evil.example', 'data:text/html,test']) {
        draft.editorial.primaryLink = url;
        assert.equal((await f.actions.saveContentDraft({ key: 'home', version: 0 }, draft)).ok, false);
    }
    draft.editorial.primaryLink = '/categoria';
    draft.editorial.image = 'https://unsupported.example/image.jpg';
    assert.equal(f.schema.homeSchema.safeParse(draft).success, false);
    draft.editorial.image = '/heroImage.jpg'; draft.featured.count = 13;
    assert.equal(f.schema.homeSchema.safeParse(draft).success, false);
    assert.equal(f.rows.get('home').version, 0);
});

test('blank WhatsApp is allowed and invalid contact data is rejected', () => {
    const { schema } = fixture();
    assert.equal(schema.businessSchema.safeParse({ ...schema.defaultBusiness, whatsapp: '' }).success, true);
    assert.equal(schema.businessSchema.safeParse({ ...schema.defaultBusiness, whatsapp: '5493511234567' }).success, true);
    assert.equal(schema.businessSchema.safeParse({ ...schema.defaultBusiness, whatsapp: 'not-a-number' }).success, false);
    assert.equal(schema.businessSchema.safeParse({ ...schema.defaultBusiness, instagramUsername: '../redirect' }).success, false);
});
