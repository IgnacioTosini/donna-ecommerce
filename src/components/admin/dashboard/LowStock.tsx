import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-session';
import './low-stock.scss';

export async function LowStock() {
    if (!await isAdminAuthenticated()) throw new Error('No autorizado');
    const where = { stock: { lte: 3 }, variant: { product: { active: true } } };
    const [total, sizes] = await Promise.all([
        prisma.productSizeStock.count({ where }),
        prisma.productSizeStock.findMany({ where, include: { variant: { include: { product: { select: { id: true, name: true } } } } }, orderBy: [{ stock: 'asc' }, { id: 'asc' }], take: 50 }),
    ]);
    return <section className="low-stock">
        <header><div><h2>Stock bajo</h2><p>{total} variantes por talle con 3 unidades o menos. Solo productos activos.</p></div><Link href="/admin/productos">Gestionar stock</Link></header>
        {sizes.length === 0 ? <p>No hay alertas de stock.</p> : <div className="low-stock-scroll"><table>
            <thead><tr><th>Producto</th><th>Color</th><th>Talle</th><th>SKU</th><th>Unidades</th></tr></thead>
            <tbody>{sizes.map(size => <tr key={size.id}>
                <td><Link href={`/admin/productos?editar=${encodeURIComponent(size.variant.product.id)}`}>{size.variant.product.name}</Link></td>
                <td>{size.variant.name || size.variant.colorHex}</td><td>{size.size}</td><td>{size.sku || '—'}</td>
                <td><strong className={size.stock === 0 ? 'empty' : ''}>{size.stock === 0 ? 'Agotado' : size.stock}</strong></td>
            </tr>)}</tbody>
        </table></div>}
        {total > sizes.length && <p>Mostrando las {sizes.length} variantes con menor stock de {total}. Consultá el resto en Productos.</p>}
    </section>;
}
