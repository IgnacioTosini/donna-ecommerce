import { z } from "zod";

export const ProductSizeStockSchema = z.object({
    id: z.cuid2().optional(),

    size: z
        .string()
        .min(1, "El talle es obligatorio")
        .max(20, "El talle no puede superar los 20 caracteres"),

    stock: z
        .number()
        .int("El stock debe ser un número entero")
        .min(0, "El stock no puede ser negativo"),

    sku: z
        .string()
        .max(100, "El SKU no puede superar los 100 caracteres")
        .nullable()
        .optional(),
});

export const ProductVariantSchema = z.object({
    id: z.cuid2().optional(),

    name: z
        .string()
        .min(1, "El nombre del color es obligatorio")
        .max(50, "El nombre del color no puede superar los 50 caracteres"),

    colorHex: z
        .string()
        .regex(
            /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
            "Color inválido"
        ),

    sizes: z
        .array(ProductSizeStockSchema)
        .min(1, "Debe agregar al menos un talle"),
});

export type ProductSizeStockDto = z.infer<typeof ProductSizeStockSchema>;
export type ProductVariantDto = z.infer<typeof ProductVariantSchema>;
