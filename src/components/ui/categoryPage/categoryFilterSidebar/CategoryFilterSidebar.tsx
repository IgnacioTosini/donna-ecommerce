'use client';

import { Category, ProductWithRelations } from '@/types';
import { CategoryFilterMobileBar } from './CategoryFilterMobileBar';
import { CategoryFilterMobileSheet } from './CategoryFilterMobileSheet';
import { CategoryFilterSections } from './CategoryFilterSections';
import { buildCategoryFilterChips } from './categoryFilterChips';
import { CategoryFilters } from './categoryFilterSidebar.types';
import { useCategoryFilterOptions } from './useCategoryFilterOptions';
import { useMobileFilterSheet } from './useMobileFilterSheet';
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
    const mobileFilterSheet = useMobileFilterSheet();

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
    const filterOptions = useCategoryFilterOptions({
        products,
        priceProducts,
        filters,
    });
    const activeFilterChips = buildCategoryFilterChips({
        categories,
        filters,
        selectedMaxPrice: filterOptions.selectedMaxPrice,
        buildFilterHref,
    });
    const activeFilterCount = activeFilterChips.length;

    const renderFilterSections = () => (
        <CategoryFilterSections
            categories={categories}
            filters={filters}
            sortedSizes={filterOptions.sortedSizes}
            sortedColors={filterOptions.sortedColors}
            minPrice={filterOptions.minPrice}
            maxAvailablePrice={filterOptions.maxAvailablePrice}
            selectedMaxPrice={filterOptions.selectedMaxPrice}
            buildFilterHref={buildFilterHref}
            onApplyPrice={mobileFilterSheet.close}
        />
    );

    return (
        <>
            <CategoryFilterMobileBar
                isOpen={mobileFilterSheet.isOpen}
                activeFilterChips={activeFilterChips}
                onOpen={mobileFilterSheet.open}
            />

            <aside className="category-filter-sidebar category-filter-sidebar-desktop">
                {renderFilterSections()}
            </aside>

            <CategoryFilterMobileSheet
                isOpen={mobileFilterSheet.isOpen}
                activeFilterCount={activeFilterCount}
                onClose={mobileFilterSheet.close}
            >
                {renderFilterSections()}
            </CategoryFilterMobileSheet>
        </>
    );
};
