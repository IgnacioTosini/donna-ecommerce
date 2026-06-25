import { z } from "zod";

export const ProductImageSchema = z.object({
    url: z.url(),
    publicId: z.string(),

    order: z
        .number()
        .int()
        .min(0)
});

export type ProductImageDto = z.infer<typeof ProductImageSchema>;