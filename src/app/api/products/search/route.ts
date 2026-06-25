import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";

    if (!query) {
        return Response.json({ products: [] });
    }

    const products = await prisma.product.findMany({
        where: {
            active: true,
            OR: [
                {
                    name: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
                {
                    slug: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
                {
                    category: {
                        name: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                },
            ],
        },
        select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            category: {
                select: {
                    name: true,
                },
            },
            images: {
                take: 1,
                orderBy: {
                    order: "asc",
                },
                select: {
                    url: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 6,
    });

    return Response.json({
        products: products.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: Number(product.price),
            categoryName: product.category.name,
            imageUrl: product.images[0]?.url ?? null,
        })),
    });
}
