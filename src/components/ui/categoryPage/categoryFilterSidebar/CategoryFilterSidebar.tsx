'use client';

import { useMemo } from 'react';
import { Category, ProductWithRelations } from '@/types';
import { CategoryFilterSection } from './categoryFilterSection/CategoryFilterSection';
import { ColorFilterSection } from './colorFilterSection/ColorFilterSection';
import { PriceFilterSection } from './priceFilterSection/PriceFilterSection';
import { SizeFilterSection } from './sizeFilterSection/SizeFilterSection';
import { CategoryFilters } from './categoryFilterSidebar.types';
import { normalizeColorValue } from '@/utils/colorHelpers';
import {
    PRODUCT_SIZE_ORDER,
    normalizeSizeValue,
    sizesMatch,
    sortProductSizes,
} from '@/utils/sizeHelpers';
import './_categoryFilterSidebar.scss';

interface Props {
    categories: Category[];
    products?: ProductWithRelations[];
    priceProducts?: ProductWithRelations[];
    filters?: CategoryFilters;
}

export const CategoryFilterSidebar = ({
    categories,
    products,
    priceProducts,
    filters = {},
}: Props) => {
    const sizes = new Set<string>(PRODUCT_SIZE_ORDER);
    const colors = new Set<string>();
    const activeSize = normalizeSizeValue(filters.size);

    products?.forEach((product) => {
        product.variants.forEach((variant) => {
            const hasAvailableStock = variant.sizes.some((size) =>
                size.stock > 0 &&
                (!activeSize || sizesMatch(size.size, activeSize))
            );
            const normalizedColor = normalizeColorValue(variant.colorHex);

            if (hasAvailableStock && normalizedColor) {
                colors.add(normalizedColor);
            }

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
        delete mergedFilters.page;

        Object.entries(mergedFilters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            }
        });

        const queryString = params.toString();

        return queryString ? `/categoria?${queryString}` : '/categoria';
    };

    const sortedSizes = sortProductSizes([...sizes]);

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
