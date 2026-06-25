'use client';

import { ProductWithRelations } from '@/types';
import { useProductModalStore } from '@/store/product.store';
import { ProductModal } from '../productModal/ProductModal';
import { ProductsTable } from '../productsTable/ProductsTable';
import './_productSection.scss';

interface Props {
    products: ProductWithRelations[];
}

export const ProductSection = ({ products }: Props) => {
    const isOpenProduct = useProductModalStore((state) => state.isOpen);
    const closeProduct = useProductModalStore((state) => state.close);
    const openCreateProduct = useProductModalStore((state) => state.openCreate);

    return (
        <>
            <div className="productos-header">
                <div className="productos-header-text">
                    <h1 className="productos-title">Productos</h1>
                    <p className="productos-description">{products.length} {products.length === 1 ? 'producto disponible' : 'productos disponibles'}</p>
                </div>
                <button className="productos-button" onClick={openCreateProduct}>+ Nuevo Producto</button>
            </div>
            <ProductModal isOpen={isOpenProduct} onClose={closeProduct} />
            <ProductsTable products={products} />
        </>
    )
}
