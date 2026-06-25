import { getProductBySlug } from "@/app/actions/product.action";
import { ProductDetails } from "@/components/productPage/productDetails/ProductDetails";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = Promise<{
    slug: string;
}>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        return {
            title: "Producto no encontrado",
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const description = product.description
        ?? `Comprá ${product.name} en Donna.`;

    return {
        title: product.name,
        description,
        alternates: {
            canonical: `/producto/${product.slug}`,
        },
        openGraph: {
            title: `${product.name} | Donna`,
            description,
            url: `/producto/${product.slug}`,
            type: "website",
            images: product.images[0]?.url
                ? [
                    {
                        url: product.images[0].url,
                        alt: product.name,
                    },
                ]
                : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title: `${product.name} | Donna`,
            description,
            images: product.images[0]?.url ? [product.images[0].url] : undefined,
        },
    };
}

export default async function ProductoPage({ params }: { params: Params }) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    return (
        <div className="product-page">
            <ProductDetails product={product} />
        </div>
    );
}
