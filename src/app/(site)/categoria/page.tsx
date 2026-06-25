import { getCategories } from "@/app/actions/category.action";
import { getFilteredProducts } from "@/app/actions/product.action";
import type { ProductSortOption } from "@/app/actions/product.action";
import { CategoryPageView } from "@/components/sections/categoryPage/CategoryPageView";
import type { Metadata } from "next";

type SearchParams = Promise<{
    category?: string;
    size?: string;
    color?: string;
    maxPrice?: string;
    featured?: string;
    sale?: string;
    sort?: string;
}>;

const sortOptions: ProductSortOption[] = [
    "newest",
    "priceAsc",
    "priceDesc",
    "featured",
];

const parseSort = (sort?: string): ProductSortOption =>
    sortOptions.includes(sort as ProductSortOption)
        ? (sort as ProductSortOption)
        : "newest";

const parseBooleanParam = (value?: string) => value === "true";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
    const params = await searchParams;
    const categories = await getCategories();
    const category = categories.find((item) => item.slug === params.category);
    const categoryName = category?.name ?? "Productos";
    const title = params.sale
        ? `${categoryName} en rebaja`
        : params.featured
            ? `${categoryName} destacados`
            : categoryName;
    const description = category?.description
        ?? `Explorá productos de ${categoryName.toLowerCase()} en Donna.`;

    return {
        title,
        description,
        alternates: {
            canonical: "/categoria",
        },
        openGraph: {
            title: `${title} | Donna`,
            description,
            url: "/categoria",
            images: category?.imageUrl
                ? [
                    {
                        url: category.imageUrl,
                        alt: category.name,
                    },
                ]
                : undefined,
        },
    };
}

export default async function CategoriaPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const featured = parseBooleanParam(params.featured);
    const sale = parseBooleanParam(params.sale);

    const productFilters = {
        category: params.category,
        size: params.size,
        color: params.color,
        featured,
        sale,
        sort: parseSort(params.sort),
    };
    const filterOptionProductsFilters = {
        category: params.category,
        featured,
        sale,
        sort: parseSort(params.sort),
    };

    const [categories, products, productsForFilters, productsForPriceRange] = await Promise.all([
        getCategories(),
        getFilteredProducts({
            ...productFilters,
            maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        }),
        getFilteredProducts(filterOptionProductsFilters),
        getFilteredProducts({}),
    ]);

    return (
        <CategoryPageView
            categories={categories}
            products={products}
            productsForFilters={productsForFilters}
            productsForPriceRange={productsForPriceRange}
            filters={{
                ...params,
                featured: featured ? "true" : undefined,
                sale: sale ? "true" : undefined,
            }}
        />
    );
}
