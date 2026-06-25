import { Banner } from "@/types";
import { create } from "zustand";

interface BannerModalStore {
    isOpen: boolean;
    editingBannerId: string | null;
    selectedBannerId: string | null;
    editingBanner?: Banner | null;

    selectBanner: (id: string) => void;
    openCreate: () => void;
    openEdit: (banner: Banner) => void;
    close: () => void;
}

export const useBannerModalStore =
    create<BannerModalStore>((set) => ({
        isOpen: false,
        editingBannerId: null,
        selectedBannerId: null,

        openCreate: () =>
            set({
                isOpen: true,
                editingBannerId: null,
            }),

        openEdit: (banner: Banner) =>
            set({
                isOpen: true,
                editingBannerId: banner.id,
                editingBanner: banner,
            }),

        close: () =>
            set({
                isOpen: false,
                editingBannerId: null,
                editingBanner: null,
            }),

        selectBanner: (id) =>
            set({
                selectedBannerId: id,
            }),
    }));