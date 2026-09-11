'use client';

import { ProductWithRelations } from '@/types';
import { useProductModalStore } from '@/store/product.store';
import { ProductModal } from '../productModal/ProductModal';
import { ProductsTable } from '../productsTable/ProductsTable';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import './_productSection.scss';

interface Props {
    products: ProductWithRelations[];
    initialEditId?: string;
}

export const ProductSection = ({ products, initialEditId }: Props) => {
    const router = useRouter();
    const openedFromUrl = useRef(false);
    const isOpenProduct = useProductModalStore((state) => state.isOpen);
    const closeProduct = useProductModalStore((state) => state.close);
    const openCreateProduct = useProductModalStore((state) => state.openCreate);
    const openEditProduct = useProductModalStore((state) => state.openEdit);

    useEffect(() => {
        if (!initialEditId || openedFromUrl.current) return;
        const product = products.find((item) => item.id === initialEditId);
        if (!product) return;
        openedFromUrl.current = true;
        openEditProduct(product);
    }, [initialEditId, openEditProduct, products]);

    const handleClose = () => {
        closeProduct();
        if (initialEditId) router.replace('/admin/productos', { scroll: false });
    };

    return (
        <>
            <div className="productos-header">
                <div className="productos-header-text">
                    <h1 className="productos-title">Productos</h1>
                    <p className="productos-description">{products.length} {products.length === 1 ? 'producto disponible' : 'productos disponibles'}</p>
                </div>
                <button className="productos-button" onClick={openCreateProduct}>+ Nuevo Producto</button>
            </div>
            <ProductModal isOpen={isOpenProduct} onClose={handleClose} />
            <ProductsTable products={products} />
        </>
    )
}
