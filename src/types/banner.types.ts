import { BannerPlacement } from "@prisma/client";

export interface Banner {
    id: string;

    span: string;
    title: string;
    subtitle?: string | null;

    imageUrl: string;
    publicId: string;

    buttonText?: string | null;
    buttonLink?: string | null;

    active: boolean;
    order: number;

    placement: BannerPlacement;

    createdAt: string;
    updatedAt: string;
}
