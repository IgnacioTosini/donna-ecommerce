'use client';

import { Category, ProductWithRelations } from "@/types";
import { CategoryHeader } from "@/components/ui/categoryPage/categoryHeader/CategoryHeader";
import { CategoryFilterSidebar } from "@/components/ui/categoryPage/categoryFilterSidebar/CategoryFilterSidebar";
import { ProductsGrid } from "@/components/shared/productsGrid/ProductsGrid";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { animateSectionReveal } from "@/components/animations/gsap/sectionAnimations";
import './_categoryPageView.scss';

type CategoryFilters = {
    category?: string;
    size?: string;
    color?: string;
    maxPrice?: string;
    featured?: string;
    sale?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
};

type Props = {
    categories: Category[];
    products: ProductWithRelations[];
    productsForFilters: ProductWithRelations[];
    productsForPriceRange: ProductWithRelations[];
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalProducts: number;
        pageSize: number;
    };
    filters: CategoryFilters;
};

export const CategoryPageView = ({
    categories,
    products,
    productsForFilters,
    productsForPriceRange,
    pagination,
    filters,
}: Props) => {
    const activeCategory = categories.find(
        (category) => category.slug === filters.category
    );
    const pageRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!pageRef.current) return;

        const ctx = gsap.context(() => {
            animateSectionReveal(
                pageRef.current!,
                '.category-header-content > *, .category-filter-section',
                {
                    start: 'top 88%',
                    stagger: 0.09,
                    y: 18,
                }
            );
        }, pageRef.current);

        return () => ctx.revert();
    }, []);

    return (
        <main ref={pageRef} className="category-page">
            <CategoryHeader activeCategory={activeCategory} />
            <div className="category-page-content">
                <CategoryFilterSidebar
                    categories={categories}
                    products={productsForFilters}
                    priceProducts={productsForPriceRange}
                    filters={filters}
                />
                <ProductsGrid
                    products={products}
                    pagination={pagination}
                    filters={{
                        category: filters.category,
                        color: filters.color,
                        featured: filters.featured,
                        maxPrice: filters.maxPrice,
                        sale: filters.sale,
                        size: filters.size,
                        sort: filters.sort,
                    }}
                />
            </div>
        </main>
    );
};
