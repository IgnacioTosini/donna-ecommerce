import { z } from "zod";

export const CategorySchema = z.object({
    name: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50),

    slug: z
        .string()
        .min(2)
        .max(50),

    description: z
        .string()
        .max(500)
        .optional()
        .nullable(),

    imageUrl: z
        .url()
        .optional()
        .nullable(),

    publicId: z
        .string()
        .optional()
        .nullable(),
});

export type CreateCategoryDto = z.infer<typeof CategorySchema>;