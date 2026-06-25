import { Product } from "./product.types";

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string | null;

    products: Product[];

    imageUrl?: string | null;
    publicId?: string | null;

    createdAt: string;
    updatedAt: string;
}