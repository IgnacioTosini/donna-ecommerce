"use client";

import { ProductWithRelations } from '@/types';
import Image from 'next/image';
import { IoBagHandleOutline } from 'react-icons/io5';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import './_productsGrid.scss';

interface Props {
    products: ProductWithRelations[];
    filters?: {
        color?: string;
        size?: string;
    };
}

export const ProductsGrid = ({ products, filters = {} }: Props) => {
    const addItem = useCartStore((state) => state.addItem);
    const genderLabels = {
        MEN: 'HOMBRE',
        WOMEN: 'MUJER',
        UNISEX: 'UNISEX',
    };

    const getDiscountPercentage = (price: number, compareAtPrice?: number | null) => {
        if (!compareAtPrice || compareAtPrice <= price) return null;

        return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
    }

    const getCartSelection = (product: ProductWithRelations) => {
        const selectedColor = filters.color?.trim();
        const selectedSize = filters.size?.trim().toUpperCase();

        const matchingVariants = selectedColor
            ? product.variants.filter((variant) => variant.colorHex === selectedColor)
            : product.variants;

        for (const variant of matchingVariants) {
            const sizeStock = selectedSize
                ? variant.sizes.find((size) => size.size === selectedSize && size.stock > 0)
                : variant.sizes.find((size) => size.stock > 0);

            if (sizeStock) {
                return { variant, sizeStock };
            }
        }

        if (selectedColor || selectedSize) {
            for (const variant of product.variants) {
                const sizeStock = selectedSize
                    ? variant.sizes.find((size) => size.size === selectedSize && size.stock > 0)
                    : variant.sizes.find((size) => size.stock > 0);

                if (sizeStock) {
                    return { variant, sizeStock };
                }
            }
        }

        return null;
    };

    const handleAddToCart = (product: ProductWithRelations) => {
        const selection = getCartSelection(product);

        if (!selection) return;

        const { variant, sizeStock } = selection;


        addItem({
            itemKey: `${variant.id}-${sizeStock.id}`,
            productId: product.id,
            variantId: variant.id,
            productSizeStockId: sizeStock.id,
            productName: product.name,
            variantName: variant.name,
            colorHex: variant.colorHex,
            size: sizeStock.size,
            name: `${product.name} - ${variant.name ?? variant.colorHex} / ${sizeStock.size}`,
            image: product.images[0]?.url ?? '',
            price: product.price,
            quantity: 1,
        });
    };

    return (
        <div className="products-grid">
            {products.map((product) => {
                const primaryImage = product.images[0];
                const hoverImage = product.images[1] ?? primaryImage;
                const label = product.gender ? genderLabels[product.gender] : product.category.name.toUpperCase();
                const discountPercentage = getDiscountPercentage(product.price, product.compareAtPrice);
                const hasStock = Boolean(getCartSelection(product));

                return (
                    <article key={product.id} className="product-card">
                        <div className="product-image-wrapper">
                            {discountPercentage && (
                                <span className="product-discount">-{discountPercentage}%</span>
                            )}
                            {primaryImage && (
                                <Image
                                    src={primaryImage.url}
                                    alt={product.name}
                                    className="product-image product-image-primary"
                                    fill
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                />
                            )}

                            {hoverImage && hoverImage.id !== primaryImage?.id && (
                                <Image
                                    src={hoverImage.url}
                                    alt={product.name}
                                    className="product-image product-image-hover"
                                    fill
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                />
                            )}

                            <button
                                type="button"
                                className="product-cart-button"
                                disabled={!hasStock}
                                onClick={() => handleAddToCart(product)}
                            >
                                <IoBagHandleOutline />
                                {hasStock ? 'Añadir al carrito' : 'Sin stock'}
                            </button>
                        </div>

                        <Link href={`/producto/${product.slug}`} className="product-info">
                            <p className="product-category">{label}</p>
                            <h3 className="product-name">{product.name}</h3>
                            <div className={`product-prices`}>
                                <p className="product-price">${product.price}</p>
                                {discountPercentage && <p className="product-compare-at-price">${product.compareAtPrice}</p>}
                            </div>
                        </Link>
                    </article>
                );
            })}
        </div>
    )
}
