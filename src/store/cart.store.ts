"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
    itemKey: string;
    productId: string;
    variantId: string;
    productSizeStockId: string;

    productName: string;
    variantName?: string | null;
    colorHex: string;
    size: string;
    name: string;
    image: string;

    price: number;
    quantity: number;
};

type AddCartItemInput = Omit<CartItem, "quantity"> & {
    quantity?: number;
};

type CartState = {
    items: CartItem[];

    totalItems: number;
    subtotal: number;
    isOpen: boolean;

    addItem: (
        item: AddCartItemInput
    ) => void;

    updateItemQuantity: (
        itemKey: string,
        quantity: number
    ) => void;

    removeItem: (
        itemKey: string
    ) => void;

    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    clearCart: () => void;
};

function calculateTotals(
    items: CartItem[]
) {
    return {
        totalItems: items.reduce(
            (acc, item) =>
                acc + item.quantity,
            0
        ),
        subtotal: items.reduce(
            (acc, item) =>
                acc +
                item.price * item.quantity,
            0
        ),
    };
}

function isCartItem(item: unknown): item is CartItem {
    if (!item || typeof item !== "object") {
        return false;
    }

    const cartItem = item as Partial<CartItem>;

    return Boolean(
        cartItem.itemKey &&
        cartItem.productId &&
        cartItem.variantId &&
        cartItem.productSizeStockId &&
        cartItem.productName &&
        cartItem.colorHex &&
        cartItem.size &&
        typeof cartItem.price === "number" &&
        typeof cartItem.quantity === "number"
    );
}

export const useCartStore =
    create<CartState>()(
        persist(
            (set) => ({
                items: [],
                totalItems: 0,
                subtotal: 0,
                isOpen: false,

                addItem: (item) => {
                    const safeQuantity =
                        item.quantity &&
                            item.quantity > 0
                            ? item.quantity
                            : 1;

                    set((state) => {
                        const existingIndex =
                            state.items.findIndex(
                                (
                                    cartItem
                                ) =>
                                    cartItem.itemKey ===
                                    item.itemKey
                            );

                        let nextItems: CartItem[];

                        if (
                            existingIndex >= 0
                        ) {
                            nextItems =
                                state.items.map(
                                    (
                                        cartItem,
                                        index
                                    ) =>
                                        index ===
                                            existingIndex
                                            ? {
                                                ...cartItem,
                                                quantity:
                                                    cartItem.quantity +
                                                    safeQuantity,
                                            }
                                            : cartItem
                                );
                        } else {
                            nextItems = [
                                ...state.items,
                                {
                                    ...item,
                                    quantity:
                                        safeQuantity,
                                },
                            ];
                        }

                        return {
                            items: nextItems,
                            isOpen: true,
                            ...calculateTotals(
                                nextItems
                            ),
                        };
                    });
                },

                updateItemQuantity: (
                    itemKey,
                    quantity
                ) => {
                    set((state) => {
                        const safeQuantity =
                            Math.max(
                                0,
                                Math.floor(
                                    quantity
                                )
                            );

                        const nextItems =
                            safeQuantity === 0
                                ? state.items.filter(
                                    (
                                        item
                                    ) =>
                                        item.itemKey !==
                                        itemKey
                                )
                                : state.items.map(
                                    (
                                        item
                                    ) =>
                                        item.itemKey ===
                                            itemKey
                                            ? {
                                                ...item,
                                                quantity:
                                                    safeQuantity,
                                            }
                                            : item
                                );

                        return {
                            items: nextItems,
                            ...calculateTotals(
                                nextItems
                            ),
                        };
                    });
                },

                removeItem: (
                    itemKey
                ) => {
                    set((state) => {
                        const nextItems =
                            state.items.filter(
                                (item) =>
                                    item.itemKey !==
                                    itemKey
                            );

                        return {
                            items: nextItems,
                            ...calculateTotals(
                                nextItems
                            ),
                        };
                    });
                },

                openCart: () => {
                    set({ isOpen: true });
                },

                closeCart: () => {
                    set({ isOpen: false });
                },

                toggleCart: () => {
                    set((state) => ({
                        isOpen: !state.isOpen,
                    }));
                },

                clearCart: () => {
                    set({
                        items: [],
                        totalItems: 0,
                        subtotal: 0,
                    });
                },
            }),
            {
                name: "donna-cart",
                version: 2,
                storage:
                    createJSONStorage(
                        () => localStorage
                    ),
                migrate: (persistedState) => {
                    if (
                        !persistedState ||
                        typeof persistedState !==
                        "object"
                    ) {
                        return {
                            items: [],
                            totalItems: 0,
                            subtotal: 0,
                            isOpen: false,
                        };
                    }

                    const state =
                        persistedState as Partial<CartState>;
                    const items = Array.isArray(
                        state.items
                    )
                        ? state.items.filter(
                            isCartItem
                        )
                        : [];

                    return {
                        ...state,
                        items,
                        isOpen: false,
                        ...calculateTotals(items),
                    };
                },
                partialize: (state) => ({
                    items: state.items,
                    totalItems:
                        state.totalItems,
                    subtotal: state.subtotal,
                }),
            }
        )
    );
