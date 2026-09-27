import { Category } from '@/types';
import { colorsMatch } from '@/utils/colorHelpers';
import { normalizeSizeValue, sizesMatch } from '@/utils/sizeHelpers';
import { CategoryFilterSection } from './categoryFilterSection/CategoryFilterSection';
import { ColorFilterSection } from './colorFilterSection/ColorFilterSection';
import { GenderFilterSection } from './genderFilterSection/GenderFilterSection';
import { PriceFilterSection } from './priceFilterSection/PriceFilterSection';
import { SizeFilterSection } from './sizeFilterSection/SizeFilterSection';
import { CategoryFilters } from './categoryFilterSidebar.types';

type Props = {
    categories: Category[];
    filters: CategoryFilters;
    sortedSizes: string[];
    sortedColors: string[];
    minPrice: number;
    maxAvailablePrice: number;
    selectedMaxPrice: number;
    onChange: (filters: Partial<CategoryFilters>) => void;
};

export const CategoryFilterSections = ({
    categories,
    filters,
    sortedSizes,
    sortedColors,
    minPrice,
    maxAvailablePrice,
    selectedMaxPrice,
    onChange,
}: Props) => (
    <>
        <GenderFilterSection
            filters={filters}
            onChange={onChange}
        />
        <CategoryFilterSection
            categories={categories}
            filters={filters}
            onChange={onChange}
        />
        <SizeFilterSection
            sizes={sortedSizes}
            filters={filters}
            onSelectSize={(size) => onChange({ size: sizesMatch(filters.size, size) ? undefined : normalizeSizeValue(size) })}
        />
        <ColorFilterSection
            colors={sortedColors}
            filters={filters}
            onSelectColor={(color) => onChange({ color: colorsMatch(filters.color, color) ? undefined : color })}
        />
        <PriceFilterSection
            minPrice={minPrice}
            maxAvailablePrice={maxAvailablePrice}
            selectedMaxPrice={selectedMaxPrice}
            onChange={(price) => onChange({ maxPrice: String(price) })}
        />
    </>
);
