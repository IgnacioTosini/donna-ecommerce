import { z } from "zod";
import { ProductImageSchema } from "./product-image.schema";
import { ProductVariantSchema } from "./product-variant.schema";

export const GenderEnum = z.enum([
    "MEN",
    "WOMEN",
    "UNISEX",
]);

export const ProductFormSchema = z.object({
    name: z.string().min(2, "El nombre es obligatorio").max(100),
    slug: z.string().min(2, "El slug es obligatorio"),
    description: z.string().nullable().optional(),
    price: z.number().positive("El precio debe ser un número positivo"),
    compareAtPrice: z.number().min(0, "El precio anterior no puede ser negativo").nullable().optional(),
    gender: GenderEnum,
    featured: z.boolean(),
    active: z.boolean(),
    categoryId: z.cuid2(),
}).refine(
    (data) =>
        !data.compareAtPrice ||
        data.compareAtPrice > data.price,
    {
        message: "El precio anterior debe ser mayor al precio actual",
        path: ["compareAtPrice"],
    }
);

export type CreateProductForm =
    z.infer<typeof ProductFormSchema>;

export const ProductSchema =
    ProductFormSchema.extend({
        images: z.array(ProductImageSchema),
        variants: z
            .array(ProductVariantSchema)
            .min(1, "Debe agregar al menos una variante"),
    });

export type CreateProductDto =
    z.infer<typeof ProductSchema>;
