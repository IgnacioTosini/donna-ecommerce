import { Category } from '@/types';
import { CategoryFilterSection } from './categoryFilterSection/CategoryFilterSection';
import { ColorFilterSection } from './colorFilterSection/ColorFilterSection';
import { GenderFilterSection } from './genderFilterSection/GenderFilterSection';
import { PriceFilterSection } from './priceFilterSection/PriceFilterSection';
import { SizeFilterSection } from './sizeFilterSection/SizeFilterSection';
import { BuildFilterHref, CategoryFilters } from './categoryFilterSidebar.types';

type Props = {
    categories: Category[];
    filters: CategoryFilters;
    sortedSizes: string[];
    sortedColors: string[];
    minPrice: number;
    maxAvailablePrice: number;
    selectedMaxPrice: number;
    buildFilterHref: BuildFilterHref;
    onApplyPrice?: () => void;
};

export const CategoryFilterSections = ({
    categories,
    filters,
    sortedSizes,
    sortedColors,
    minPrice,
    maxAvailablePrice,
    selectedMaxPrice,
    buildFilterHref,
    onApplyPrice,
}: Props) => (
    <>
        <GenderFilterSection
            filters={filters}
            buildFilterHref={buildFilterHref}
        />
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
            onApply={onApplyPrice}
        />
    </>
);
