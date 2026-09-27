'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import type { ProductFilterOptions } from '@/app/actions/product.action';
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
    options: ProductFilterOptions;
    filters?: CategoryFilters;
}

const emptyFilters: CategoryFilters = {};

export const CategoryFilterSidebar = ({
    categories,
    options,
    filters = emptyFilters,
}: Props) => {
    const mobileFilterSheet = useMobileFilterSheet();
    const router = useRouter();
    const [draftFilters, setDraftFilters] = useState(filters);
    const [previousFilters, setPreviousFilters] = useState(filters);

    if (previousFilters !== filters) {
        setPreviousFilters(filters);
        setDraftFilters(filters);
    }

    const applyFilters = () => {
        router.push(buildFilterHref(draftFilters, {}, emptyFilters), { scroll: false });
        mobileFilterSheet.close();
    };

    const buildFilterHref = (
        nextFilters: Partial<CategoryFilters>,
        options: { resetPrice?: boolean } = {},
        baseFilters: CategoryFilters = filters
    ) => {
        const params = new URLSearchParams();
        const mergedFilters = { ...baseFilters, ...nextFilters };

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
        options,
        filters: draftFilters,
    });
    const desktopFilterOptions = useCategoryFilterOptions({ options, filters });
    const activeFilterChips = buildCategoryFilterChips({
        categories,
        filters,
        selectedMaxPrice: filters.maxPrice ? Number(filters.maxPrice) : options.maxPrice,
        buildFilterHref,
    });
    const activeFilterCount = activeFilterChips.length;

    const renderFilterSections = (applyImmediately = false) => (
        <CategoryFilterSections
            categories={categories}
            filters={applyImmediately ? filters : draftFilters}
            sortedSizes={filterOptions.sortedSizes}
            sortedColors={filterOptions.sortedColors}
            minPrice={filterOptions.minPrice}
            maxAvailablePrice={filterOptions.maxAvailablePrice}
            selectedMaxPrice={applyImmediately ? desktopFilterOptions.selectedMaxPrice : filterOptions.selectedMaxPrice}
            onChange={(changes) => {
                if (applyImmediately) {
                    router.push(buildFilterHref(changes), { scroll: false });
                } else {
                    setDraftFilters((current) => ({ ...current, ...changes }));
                }
            }}
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
                {renderFilterSections(true)}
            </aside>

            <CategoryFilterMobileSheet
                isOpen={mobileFilterSheet.isOpen}
                activeFilterCount={activeFilterCount}
                onClose={mobileFilterSheet.close}
                onApply={applyFilters}
                onClear={() => setDraftFilters({ pageSize: draftFilters.pageSize })}
            >
                {renderFilterSections()}
            </CategoryFilterMobileSheet>
        </>
    );
};
