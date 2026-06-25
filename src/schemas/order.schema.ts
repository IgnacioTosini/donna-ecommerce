import { z } from "zod";
import { OrderItemSchema } from "./order-item.schema";

export const OrderSchema = z.object({
    customerName: z
        .string()
        .min(2)
        .max(100),

    phone: z
        .string()
        .min(6)
        .max(30),

    items: z
        .array(OrderItemSchema)
        .min(1),
});

export type CreateOrderDto = z.infer<typeof OrderSchema>;