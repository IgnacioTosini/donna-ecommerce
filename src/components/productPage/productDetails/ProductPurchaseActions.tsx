'use client';

import { useState } from 'react';

type Props = {
    disabled?: boolean;
    maxQuantity?: number;
    onAddToCart: (quantity: number) => void;
    onBuyNow?: (quantity: number) => void;
};

export const ProductPurchaseActions = ({
    disabled = false,
    maxQuantity = 1,
    onAddToCart,
    onBuyNow,
}: Props) => {
    const safeMaxQuantity = Math.max(1, maxQuantity);
    const [quantity, setQuantity] = useState(1);
    const selectedQuantity = Math.min(quantity, safeMaxQuantity);

    const decreaseQuantity = () => {
        setQuantity((currentQuantity) => Math.max(1, Math.min(currentQuantity, safeMaxQuantity) - 1));
    };

    const increaseQuantity = () => {
        setQuantity((currentQuantity) => Math.min(safeMaxQuantity, currentQuantity + 1));
    };

    const handleQuantityChange = (value: string) => {
        const nextQuantity = Number(value);

        if (!Number.isFinite(nextQuantity)) return;

        setQuantity(Math.min(Math.max(1, Math.floor(nextQuantity)), safeMaxQuantity));
    };

    return (
        <div>
            <div className="product-purchase-actions">
                <div className="product-purchase-quantity">
                    <button
                        type="button"
                        className="product-purchase-quantity-button"
                        disabled={disabled || selectedQuantity <= 1}
                        aria-label="Reducir cantidad"
                        onClick={decreaseQuantity}
                    >
                        -
                    </button>
                    <input
                        type="number"
                        min={1}
                        max={safeMaxQuantity}
                        value={selectedQuantity}
                        className="product-purchase-quantity-input"
                        aria-label="Cantidad"
                        disabled={disabled}
                        onChange={(event) => handleQuantityChange(event.target.value)}
                    />
                    <button
                        type="button"
                        className="product-purchase-quantity-button"
                        disabled={disabled || selectedQuantity >= safeMaxQuantity}
                        aria-label="Aumentar cantidad"
                        onClick={increaseQuantity}
                    >
                        +
                    </button>
                </div>
                <button
                    type="button"
                    className="product-purchase-add-button"
                    disabled={disabled}
                    onClick={() => onAddToCart(selectedQuantity)}
                >
                    Añadir al carrito
                </button>
            </div>

            {onBuyNow && (
                <button
                    type="button"
                    className="product-details-buy-button"
                    disabled={disabled}
                    onClick={() => onBuyNow(selectedQuantity)}
                >
                    Comprar ahora
                </button>
            )}
        </div>
    );
};
