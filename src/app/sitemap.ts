import type { MetadataRoute } from "next";
import { getCategories } from "./actions/category.action";
import { getProducts } from "./actions/product.action";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://donna.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [categories, products] = await Promise.all([
        getCategories(),
        getProducts(),
    ]);

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${siteUrl}/categoria`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },
    ];

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
        url: `${siteUrl}/categoria?category=${category.slug}`,
        lastModified: new Date(category.updatedAt),
        changeFrequency: "weekly",
        priority: 0.7,
    }));

    const productRoutes: MetadataRoute.Sitemap = products
        .filter((product) => product.active)
        .map((product) => ({
            url: `${siteUrl}/producto/${product.slug}`,
            lastModified: new Date(product.updatedAt),
            changeFrequency: "weekly",
            priority: product.featured ? 0.8 : 0.6,
        }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
