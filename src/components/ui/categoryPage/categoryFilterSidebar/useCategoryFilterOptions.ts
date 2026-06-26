import { useMemo } from 'react';
import { ProductWithRelations } from '@/types';
import { normalizeColorValue } from '@/utils/colorHelpers';
import {
    PRODUCT_SIZE_ORDER,
    normalizeSizeValue,
    sizesMatch,
    sortProductSizes,
} from '@/utils/sizeHelpers';
import { CategoryFilters } from './categoryFilterSidebar.types';

type Params = {
    products?: ProductWithRelations[];
    priceProducts?: ProductWithRelations[];
    filters: CategoryFilters;
};

export const useCategoryFilterOptions = ({
    products,
    priceProducts,
    filters,
}: Params) => {
    const activeSize = normalizeSizeValue(filters.size);

    const { sortedSizes, sortedColors } = useMemo(() => {
        const sizes = new Set<string>(PRODUCT_SIZE_ORDER);
        const colors = new Set<string>();

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

        return {
            sortedSizes: sortProductSizes([...sizes]),
            sortedColors: [...colors].sort(),
        };
    }, [activeSize, products]);

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

    return {
        sortedSizes,
        sortedColors,
        minPrice: priceRange.min,
        maxAvailablePrice: priceRange.max,
        selectedMaxPrice,
    };
};
