import { z } from "zod";

export const OrderItemSchema = z.object({
    variantId: z.cuid2(),
    productSizeStockId: z.cuid2(),

    quantity: z
        .number()
        .int()
        .positive(),
});

export type OrderItemDto = z.infer<typeof OrderItemSchema>;
