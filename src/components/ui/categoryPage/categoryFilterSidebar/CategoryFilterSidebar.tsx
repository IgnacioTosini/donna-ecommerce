'use client';

import { useMemo } from 'react';
import { Category, ProductWithRelations } from '@/types';
import { CategoryFilterSection } from './categoryFilterSection/CategoryFilterSection';
import { ColorFilterSection } from './colorFilterSection/ColorFilterSection';
import { PriceFilterSection } from './priceFilterSection/PriceFilterSection';
import { SizeFilterSection } from './sizeFilterSection/SizeFilterSection';
import { CategoryFilters } from './categoryFilterSidebar.types';
import './_categoryFilterSidebar.scss';

interface Props {
    categories: Category[];
    products?: ProductWithRelations[];
    priceProducts?: ProductWithRelations[];
    filters?: CategoryFilters;
}

const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const CategoryFilterSidebar = ({
    categories,
    products,
    priceProducts,
    filters = {},
}: Props) => {
    const sizes = new Set<string>(sizeOrder);
    const colors = new Set<string>();

    products?.forEach((product) => {
        product.variants.forEach((variant) => {
            colors.add(variant.colorHex);

            variant.sizes.forEach((size) => {
                sizes.add(size.size);
            });
        });
    });

    const buildFilterHref = (
        nextFilters: Partial<CategoryFilters>,
        options: { resetPrice?: boolean } = {}
    ) => {
        const params = new URLSearchParams();
        const mergedFilters = { ...filters, ...nextFilters };

        if (options.resetPrice) {
            delete mergedFilters.maxPrice;
        }

        Object.entries(mergedFilters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            }
        });

        const queryString = params.toString();

        return queryString ? `/categoria?${queryString}` : '/categoria';
    };

    const sortedSizes = [...sizes].sort((a, b) => {
        const aIndex = sizeOrder.indexOf(a);
        const bIndex = sizeOrder.indexOf(b);

        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;

        return aIndex - bIndex;
    });

    const sortedColors = [...colors].sort();
    const priceRange = useMemo(() => {
        const productPrices = (priceProducts ?? products)?.map((product) => product.price) ?? [];

        return {
            min: productPrices.length ? Math.floor(Math.min(...productPrices)) : 0,
            max: productPrices.length ? Math.ceil(Math.max(...productPrices)) : 0,
        };
    }, [priceProducts, products]);
    const parsedMaxPrice = filters.maxPrice ? Number(filters.maxPrice) : priceRange.max;
    const selectedMaxPrice = Number.isFinite(parsedMaxPrice)
        ? Math.min(Math.max(parsedMaxPrice, priceRange.min), priceRange.max)
        : priceRange.max;
    const minPrice = priceRange.min;
    const maxAvailablePrice = priceRange.max;

    return (
        <aside className="category-filter-sidebar">
            <CategoryFilterSection
                categories={categories}
                filters={filters}
                buildFilterHref={buildFilterHref}
            />
            <SizeFilterSection
                sizes={sortedSizes}
                filters={filters}
                buildFilterHref={buildFilterHref}
            />
            <ColorFilterSection
                colors={sortedColors}
                filters={filters}
                buildFilterHref={buildFilterHref}
            />
            <PriceFilterSection
                filters={filters}
                minPrice={minPrice}
                maxAvailablePrice={maxAvailablePrice}
                selectedMaxPrice={selectedMaxPrice}
            />
        </aside>
    );
};
