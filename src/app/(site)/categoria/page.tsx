import { getCategories } from "@/app/actions/category.action";
import { getFilteredProducts, getPaginatedFilteredProducts } from "@/app/actions/product.action";
import type { ProductSortOption } from "@/app/actions/product.action";
import { CategoryPageView } from "@/components/sections/categoryPage/CategoryPageView";
import { Gender } from "@prisma/client";
import type { Metadata } from "next";

type SearchParams = Promise<{
    category?: string;
    gender?: string;
    size?: string;
    color?: string;
    maxPrice?: string;
    featured?: string;
    sale?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
}>;

const sortOptions: ProductSortOption[] = [
    "newest",
    "priceAsc",
    "priceDesc",
    "featured",
];
const genderLabels: Record<Gender, string> = {
    MEN: "Hombre",
    WOMEN: "Mujer",
    UNISEX: "Unisex",
};
const genderOptions = Object.keys(genderLabels) as Gender[];

const parseSort = (sort?: string): ProductSortOption =>
    sortOptions.includes(sort as ProductSortOption)
        ? (sort as ProductSortOption)
        : "newest";

const parseBooleanParam = (value?: string) => value === "true";
const parseGender = (gender?: string): Gender | undefined =>
    genderOptions.includes(gender as Gender)
        ? (gender as Gender)
        : undefined;
const parsePositiveIntegerParam = (value?: string, fallback = 1) => {
    const numberValue = Number(value);

    return Number.isInteger(numberValue) && numberValue > 0
        ? numberValue
        : fallback;
};

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
    const params = await searchParams;
    const categories = await getCategories();
    const category = categories.find((item) => item.slug === params.category);
    const gender = parseGender(params.gender);
    const categoryName = category?.name ?? (gender ? genderLabels[gender] : "Productos");
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
    const gender = parseGender(params.gender);
    const page = parsePositiveIntegerParam(params.page);
    const pageSize = parsePositiveIntegerParam(params.pageSize, 10);

    const productFilters = {
        category: params.category,
        gender,
        size: params.size,
        color: params.color,
        featured,
        sale,
        sort: parseSort(params.sort),
    };
    const filterOptionProductsFilters = {
        category: params.category,
        gender,
        featured,
        sale,
        sort: parseSort(params.sort),
    };

    const [categories, paginatedProducts, productsForFilters, productsForPriceRange] = await Promise.all([
        getCategories(),
        getPaginatedFilteredProducts({
            ...productFilters,
            maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
            page,
            pageSize,
        }),
        getFilteredProducts(filterOptionProductsFilters),
        getFilteredProducts({}),
    ]);

    return (
        <CategoryPageView
            categories={categories}
            products={paginatedProducts.products}
            productsForFilters={productsForFilters}
            productsForPriceRange={productsForPriceRange}
            pagination={{
                currentPage: paginatedProducts.currentPage,
                totalPages: paginatedProducts.totalPages,
                totalProducts: paginatedProducts.totalProducts,
                pageSize: paginatedProducts.pageSize,
            }}
            filters={{
                ...params,
                gender,
                featured: featured ? "true" : undefined,
                sale: sale ? "true" : undefined,
            }}
        />
    );
}
