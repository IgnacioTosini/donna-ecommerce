import { Category } from "./category.types";
import { ProductImage } from "./product-image.types";
import { ProductVariant } from "./product-variant.types";

export type Gender = "MEN" | "WOMEN" | "UNISEX";

export interface Product {
    id: string;

    name: string;
    slug: string;

    description?: string | null;

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