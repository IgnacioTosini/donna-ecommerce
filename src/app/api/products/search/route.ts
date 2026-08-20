import { prisma } from "@/lib/prisma";
import { STOREFRONT_CACHE_SECONDS, STOREFRONT_CACHE_TAG } from "@/lib/cache-tags";
import { unstable_cache } from "next/cache";
import { NextRequest } from "next/server";

const SEARCH_MIN_LENGTH = 2;
const SEARCH_MAX_LENGTH = 80;
const SEARCH_RATE_LIMIT = 30;
const SEARCH_RATE_WINDOW_MS = 60_000;
const searchRateLimits = new Map<string, { count: number; resetAt: number }>();

const getClientIp = (request: NextRequest) =>
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";

const isWithinSearchRateLimit = (clientIp: string) => {
    const now = Date.now();

    if (searchRateLimits.size > 5_000) {
        searchRateLimits.forEach((entry, ip) => {
            if (entry.resetAt <= now) searchRateLimits.delete(ip);
        });

        if (searchRateLimits.size > 5_000) {
            searchRateLimits.clear();
        }
    }

    const current = searchRateLimits.get(clientIp);

    if (!current || current.resetAt <= now) {
        searchRateLimits.set(clientIp, {
            count: 1,
            resetAt: now + SEARCH_RATE_WINDOW_MS,
        });
        return true;
    }

    if (current.count >= SEARCH_RATE_LIMIT) {
        return false;
    }

    current.count += 1;
    return true;
};

const searchProductsCached = unstable_cache(
    async (query: string) => {
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

        return products.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: Number(product.price),
            categoryName: product.category.name,
            imageUrl: product.images[0]?.url ?? null,
        }));
    },
    ["product-search"],
    {
        revalidate: STOREFRONT_CACHE_SECONDS,
        tags: [STOREFRONT_CACHE_TAG],
    }
);

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get("q")?.trim().slice(0, SEARCH_MAX_LENGTH) ?? "";

    if (query.length < SEARCH_MIN_LENGTH) {
        return Response.json({ products: [] });
    }

    if (!isWithinSearchRateLimit(getClientIp(req))) {
        return Response.json(
            { products: [], error: "Demasiadas búsquedas. Intentá nuevamente en un minuto." },
            {
                status: 429,
                headers: {
                    "Retry-After": "60",
                },
            }
        );
    }

    const products = await searchProductsCached(query.toLocaleLowerCase("es"));

    return Response.json({
        products,
    }, {
        headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
    });
}
