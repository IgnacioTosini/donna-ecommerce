import { Category } from '@/types';
import { BuildFilterHref, CategoryFilters } from './categoryFilterSidebar.types';

export type CategoryFilterChip = {
    label: string;
    href: string;
};

const formatPrice = (price: number) => price.toLocaleString('es-AR');

const genderLabels: Record<string, string> = {
    MEN: 'Hombre',
    WOMEN: 'Mujer',
    UNISEX: 'Unisex',
};

type Params = {
    categories: Category[];
    filters: CategoryFilters;
    selectedMaxPrice: number;
    buildFilterHref: BuildFilterHref;
};

export const buildCategoryFilterChips = ({
    categories,
    filters,
    selectedMaxPrice,
    buildFilterHref,
}: Params): CategoryFilterChip[] => {
    const chips: CategoryFilterChip[] = [];
    const activeCategory = categories.find((category) => category.slug === filters.category);

    if (filters.gender) {
        chips.push({
            label: genderLabels[filters.gender] ?? filters.gender,
            href: buildFilterHref({ gender: undefined }, { resetPrice: true }),
        });
    }

    if (filters.category) {
        chips.push({
            label: activeCategory?.name ?? filters.category,
            href: buildFilterHref({ category: undefined }, { resetPrice: true }),
        });
    }

    if (filters.sort === 'newest') {
        chips.push({
            label: 'Nuevos ingresos',
            href: buildFilterHref({ sort: undefined }, { resetPrice: true }),
        });
    }

    if (filters.featured) {
        chips.push({
            label: 'Destacados',
            href: buildFilterHref({ featured: undefined }, { resetPrice: true }),
        });
    }

    if (filters.sale) {
        chips.push({
            label: 'Rebajas',
            href: buildFilterHref({ sale: undefined }, { resetPrice: true }),
        });
    }

    if (filters.size) {
        chips.push({
            label: filters.size,
            href: buildFilterHref({ size: undefined }, { resetPrice: true }),
        });
    }

    if (filters.color) {
        chips.push({
            label: filters.color,
            href: buildFilterHref({ color: undefined }, { resetPrice: true }),
        });
    }

    if (filters.maxPrice) {
        chips.push({
            label: `Hasta $${formatPrice(selectedMaxPrice)}`,
            href: buildFilterHref({ maxPrice: undefined }),
        });
    }

    return chips;
};
