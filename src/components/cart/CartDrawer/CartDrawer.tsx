"use client";

import Image from "next/image";
import { IoClose, IoTrashOutline } from "react-icons/io5";
import { useCartStore } from "@/store/cart.store";
import { CheckoutModal } from "@/components/checkout/CheckoutModal/CheckoutModal";
import { handleWhatsappCheckout } from "@/helpers/whatsapp/handleWhatsappCheckout";
import { CheckoutData } from "@/types/checkout.types";
import { toast } from "react-toastify";
import { useState } from "react";
import "./_cartDrawer.scss";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
    }).format(price);

export function CartDrawer() {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const items = useCartStore((state) => state.items);
    const totalItems = useCartStore((state) => state.totalItems);
    const subtotal = useCartStore((state) => state.subtotal);
    const isOpen = useCartStore((state) => state.isOpen);
    const closeCart = useCartStore((state) => state.closeCart);
    const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const clearCart = useCartStore((state) => state.clearCart);

    const handleCheckoutSubmit = async (data: CheckoutData) => {
        const result = await handleWhatsappCheckout({
            ...data,
            items,
            subtotal,
        }).catch(() => ({
            ok: false,
            message: "No pudimos crear el pedido.",
        }));

        if (!result.ok) {
            toast.error(result.message ?? "No pudimos crear el pedido.");
            return false;
        }

        toast.success("Pedido creado. Te abrimos WhatsApp para enviarlo.");
        clearCart();
        closeCart();
        setIsCheckoutOpen(false);

        return true;
    };

    return (
        <div className={`cart-drawer ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
            <button
                type="button"
                className="cart-drawer-backdrop"
                aria-label="Cerrar carrito"
                onClick={closeCart}
            />
            <aside
                className="cart-drawer-panel"
                aria-label="Carrito de compras"
                aria-modal="true"
                role="dialog"
            >
                <header className="cart-drawer-header">
                    <h2>Tu carrito ({totalItems})</h2>
                    <button
                        type="button"
                        className="cart-drawer-close"
                        aria-label="Cerrar carrito"
                        onClick={closeCart}
                    >
                        <IoClose />
                    </button>
                </header>

                <div className="cart-drawer-content">
                    {items.length === 0 ? (
                        <p className="cart-drawer-empty">Tu carrito está vacío.</p>
                    ) : (
                        <ul className="cart-drawer-list">
                            {items.map((item) => (
                                <li key={item.itemKey} className="cart-drawer-item">
                                    <div className="cart-drawer-image">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.productName}
                                                fill
                                                sizes="72px"
                                            />
                                        ) : (
                                            <span>{item.productName.charAt(0)}</span>
                                        )}
                                    </div>

                                    <div className="cart-drawer-item-info">
                                        <div className="cart-drawer-item-heading">
                                            <div>
                                                <h3>{item.productName}</h3>
                                                <p>Talla {item.size}</p>
                                                <p className="cart-drawer-item-color">
                                                    <span
                                                        style={{ backgroundColor: item.colorHex }}
                                                        aria-hidden="true"
                                                    />
                                                    Color {item.variantName ?? item.colorHex}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                className="cart-drawer-remove"
                                                aria-label={`Eliminar ${item.productName}`}
                                                onClick={() => removeItem(item.itemKey)}
                                            >
                                                <IoTrashOutline />
                                            </button>
                                        </div>

                                        <div className="cart-drawer-item-bottom">
                                            <div className="cart-drawer-quantity">
                                                <button
                                                    type="button"
                                                    aria-label={`Restar ${item.productName}`}
                                                    onClick={() =>
                                                        updateItemQuantity(
                                                            item.itemKey,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                >
                                                    -
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    aria-label={`Sumar ${item.productName}`}
                                                    onClick={() =>
                                                        updateItemQuantity(
                                                            item.itemKey,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="cart-drawer-price">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <footer className="cart-drawer-footer">
                    <div className="cart-drawer-subtotal">
                        <span>Subtotal</span>
                        <strong>{formatPrice(subtotal)}</strong>
                    </div>
                    <p>Impuestos incluidos. Envío calculado en el checkout.</p>
                    <button
                        type="button"
                        className="cart-drawer-checkout"
                        disabled={items.length === 0}
                        onClick={() => setIsCheckoutOpen(true)}
                    >
                        Finalizar compra
                    </button>
                </footer>
            </aside>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                onSubmit={handleCheckoutSubmit}
            />
        </div>
    );
}
