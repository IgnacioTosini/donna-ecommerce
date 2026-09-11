import { Category } from "./category.types";
import { ProductImage } from "./product-image.types";
import { ProductVariant } from "./product-variant.types";

export type Gender = "MEN" | "WOMEN" | "UNISEX";

export interface Product {
    id: string;

    name: string;
    slug: string;

    description?: string | null;
    sizeGuide?: string | null;

    price: number;
    compareAtPrice?: number | null;

    gender?: Gender | null;

    featured: boolean;
    active: boolean;

    categoryId: string;

    createdAt: string;
    updatedAt: string;
}

export type ProductCategory = Omit<Category, "products">;

export interface ProductWithRelations extends Product {
    category: ProductCategory;
    images: ProductImage[];
    variants: ProductVariant[];
}

export interface ProductListItem {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    gender?: Gender | null;
    category: {
        name: string;
    };
    images: Array<{
        id: string;
        url: string;
    }>;
    variants: Array<{
        id: string;
        name?: string | null;
        colorHex: string;
        sizes: Array<{
            id: string;
            size: string;
            stock: number;
        }>;
    }>;
}
