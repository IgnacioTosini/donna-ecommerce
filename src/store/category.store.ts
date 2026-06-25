import { Category } from "@/types";
import { create } from "zustand";

interface CategoryModalStore {
    isOpen: boolean;
    editingCategoryId: string | null;
    selectedCategoryId: string | null;
    editingCategory?: Category | null;

    selectCategory: (id: string) => void;
    openCreate: () => void;
    openEdit: (category: Category) => void;
    close: () => void;
}

export const useCategoryModalStore =
    create<CategoryModalStore>((set) => ({
        isOpen: false,
        editingCategoryId: null,
        selectedCategoryId: null,

        openCreate: () =>
            set({
                isOpen: true,
                editingCategoryId: null,
            }),

        openEdit: (category: Category) =>
            set({
                isOpen: true,
                editingCategoryId: category.id,
                editingCategory: category,
            }),

        close: () =>
            set({
                isOpen: false,
                editingCategoryId: null,
                editingCategory: null,
            }),

        selectCategory: (id) =>
            set({
                selectedCategoryId: id,
            }),
    }));