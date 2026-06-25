import { Product } from "@/types";
import { create } from "zustand";

interface ProductModalStore {
    isOpen: boolean;
    editingProductId: string | null;
    selectedProductId: string | null;
    editingProduct?: Product | null;

    selectProduct: (id: string) => void;
    openCreate: () => void;
    openEdit: (product: Product) => void;
    close: () => void;
}

export const useProductModalStore =
    create<ProductModalStore>((set) => ({
        isOpen: false,
        editingProductId: null,
        selectedProductId: null,

        openCreate: () =>
            set({
                isOpen: true,
                editingProductId: null,
            }),

        openEdit: (product: Product) =>
            set({
                isOpen: true,
                editingProductId: product.id,
                editingProduct: product,
            }),

        close: () =>
            set({
                isOpen: false,
                editingProductId: null,
                editingProduct: null,
            }),

        selectProduct: (id) =>
            set({
                selectedProductId: id,
            }),
    }));