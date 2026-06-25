import { BannerPlacement } from "@prisma/client";
import { z } from "zod";

export const BannerSchema = z.object({
    span: z.string().min(2, "El span es obligatorio").max(100),
    title: z.string().min(2, "El título es obligatorio").max(100),
    subtitle: z.string().max(250).nullable().optional(),

    buttonText: z.string().max(50).nullable().optional(),
    buttonLink: z.string().max(200).nullable().optional(),

    active: z.boolean(),
    order: z.number().int().min(0),
    placement: z.enum(BannerPlacement),
});

export type CreateBannerDto = z.infer<typeof BannerSchema>;