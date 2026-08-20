import type { ProductFilterOptions } from '@/app/actions/product.action';
import { CategoryFilters } from './categoryFilterSidebar.types';

type Params = {
    options: ProductFilterOptions;
    filters: CategoryFilters;
};

export const useCategoryFilterOptions = ({
    options,
    filters,
}: Params) => {
    const parsedMaxPrice = filters.maxPrice ? Number(filters.maxPrice) : options.maxPrice;
    const selectedMaxPrice = Number.isFinite(parsedMaxPrice)
        ? Math.min(Math.max(parsedMaxPrice, options.minPrice), options.maxPrice)
        : options.maxPrice;

    return {
        sortedSizes: options.sizes,
        sortedColors: options.colors,
        minPrice: options.minPrice,
        maxAvailablePrice: options.maxPrice,
        selectedMaxPrice,
    };
};
