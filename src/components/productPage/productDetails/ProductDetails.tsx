'use client';

import { useMemo, useState } from 'react';
import { ProductWithRelations } from '@/types'
import { ProductGallery } from '../productGallery/ProductGallery';
import { Breadcrumb } from '@/components/shared/breadcrumb/Breadcrumb';
import { SizeFilterSection } from '@/components/ui/categoryPage/categoryFilterSidebar/sizeFilterSection/SizeFilterSection';
import { ColorFilterSection } from '@/components/ui/categoryPage/categoryFilterSidebar/colorFilterSection/ColorFilterSection';
import { CartItem, useCartStore } from '@/store/cart.store';
import { ProductPurchaseActions } from './ProductPurchaseActions';
import { CheckoutModal } from '@/components/checkout/CheckoutModal/CheckoutModal';
import { handleWhatsappCheckout } from '@/helpers/whatsapp/handleWhatsappCheckout';
import { CheckoutData } from '@/types/checkout.types';
import { toast } from 'react-toastify';
import './_productDetails.scss'

interface Props {
    product: ProductWithRelations;
}

const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const sortSizes = (sizes: string[]) => [...sizes].sort((a, b) => {
    const aIndex = sizeOrder.indexOf(a);
    const bIndex = sizeOrder.indexOf(b);

    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
});

export const ProductDetails = ({ product }: Props) => {
    const addItem = useCartStore((state) => state.addItem);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
    const colors = useMemo(
        () => [...new Set(product.variants.map((variant) => variant.colorHex))].sort(),
        [product.variants]
    );

    const firstAvailableVariant = useMemo(
        () => product.variants.find((variant) => variant.sizes.some((size) => size.stock > 0))
            ?? product.variants[0],
        [product.variants]
    );

    const [selectedColor, setSelectedColor] = useState(firstAvailableVariant?.colorHex ?? colors[0] ?? '');

    const selectedVariant = useMemo(
        () => product.variants.find((variant) => variant.colorHex === selectedColor) ?? firstAvailableVariant,
        [firstAvailableVariant, product.variants, selectedColor]
    );

    const sizes = useMemo(() => {
        const variantSizes = selectedVariant?.sizes.map((size) => size.size) ?? [];

        return sortSizes([...new Set(variantSizes)]);
    }, [selectedVariant]);

    const firstAvailableSize = useMemo(
        () => sizes.find((size) =>
            selectedVariant?.sizes.some((variantSize) => variantSize.size === size && variantSize.stock > 0)
        ) ?? sizes[0] ?? '',
        [selectedVariant, sizes]
    );

    const [selectedSize, setSelectedSize] = useState(firstAvailableSize);

    const disabledColors = useMemo(
        () => product.variants
            .filter((variant) => variant.sizes.every((size) => size.stock <= 0))
            .map((variant) => variant.colorHex),
        [product.variants]
    );

    const disabledSizes = useMemo(
        () => sizes.filter((size) =>
            !selectedVariant?.sizes.some((variantSize) => variantSize.size === size && variantSize.stock > 0)
        ),
        [selectedVariant, sizes]
    );
    const selectedSizeStock = selectedVariant?.sizes.find((size) => size.size === selectedSize);
    const availableStock = selectedSizeStock?.stock ?? 0;
    const isAddToCartDisabled = !selectedColor || !selectedSize || availableStock <= 0;

    const buildSelectedCartItem = (quantity: number): CartItem | null => {
        if (!selectedVariant || !selectedSize || !selectedSizeStock) return null;

        return {
            itemKey: `${selectedVariant.id}-${selectedSizeStock.id}`,
            productId: product.id,
            variantId: selectedVariant.id,
            productSizeStockId: selectedSizeStock.id,
            productName: product.name,
            variantName: selectedVariant.name,
            colorHex: selectedVariant.colorHex,
            size: selectedSize,
            name: `${product.name} - ${selectedVariant.name ?? selectedColor} / ${selectedSize}`,
            image: product.images[0]?.url ?? '',
            price: product.price,
            quantity,
        };
    };

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);

        const nextVariant = product.variants.find((variant) => variant.colorHex === color);
        const nextSizes = sortSizes([...new Set(nextVariant?.sizes.map((size) => size.size) ?? [])]);
        const nextAvailableSize = nextSizes.find((size) =>
            nextVariant?.sizes.some((variantSize) => variantSize.size === size && variantSize.stock > 0)
        ) ?? nextSizes[0] ?? '';

        setSelectedSize(nextAvailableSize);
    };

    const handleAddToCart = (quantity: number) => {
        const item = buildSelectedCartItem(quantity);

        if (!item) return;

        addItem(item);
    };

    const handleBuyNow = (quantity: number) => {
        const item = buildSelectedCartItem(quantity);

        if (!item) return;

        setBuyNowItem(item);
        setIsCheckoutOpen(true);
    };

    const handleCheckoutSubmit = async (data: CheckoutData) => {
        if (!buyNowItem) return false;

        const result = await handleWhatsappCheckout({
            ...data,
            items: [buyNowItem],
            subtotal: buyNowItem.price * buyNowItem.quantity,
        }).catch(() => ({
            ok: false,
            message: 'No pudimos crear el pedido.',
        }));

        if (!result.ok) {
            toast.error(result.message ?? 'No pudimos crear el pedido.');
            return false;
        }

        toast.success('Pedido creado. Te abrimos WhatsApp para enviarlo.');
        setIsCheckoutOpen(false);
        setBuyNowItem(null);

        return true;
    };

    return (
        <div className="product-details">
            <div className="product-details-container">
                <Breadcrumb activeCategory={product.category} productName={product.name} />
                <div className='product-details-content'>
                    <ProductGallery images={product.images} />
                    <div>
                        <div className="product-details-info">
                            <span className="product-details-category">{product.category.name}</span>
                            <h1 className="product-details-title">{product.name}</h1>
                            <span className="product-details-price">${product.price}</span>
                        </div>
                        <ColorFilterSection
                            colors={colors}
                            selectedColor={selectedColor}
                            disabledColors={disabledColors}
                            onSelectColor={handleColorSelect}
                        />
                        <SizeFilterSection
                            sizes={sizes}
                            selectedSize={selectedSize}
                            disabledSizes={disabledSizes}
                            onSelectSize={setSelectedSize}
                        />
                        <ProductPurchaseActions
                            disabled={isAddToCartDisabled}
                            maxQuantity={availableStock}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                        />
                        <div className="product-details-description-container">
                            <h2 className="product-details-description-title">Descripción</h2>
                            <p className="product-details-description">{product.description}</p>
                        </div>
                    </div>
                </div>
            </div>
            <CheckoutModal
                isOpen={isCheckoutOpen}
                title="Datos para comprar ahora"
                onClose={() => setIsCheckoutOpen(false)}
                onSubmit={handleCheckoutSubmit}
            />
        </div>
    )
}
