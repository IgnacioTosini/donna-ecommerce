export type CategoryFilters = {
    category?: string;
    size?: string;
    color?: string;
    maxPrice?: string;
    featured?: string;
    sale?: string;
    sort?: string;
};

export type BuildFilterHref = (
    nextFilters: Partial<CategoryFilters>,
    options?: { resetPrice?: boolean }
) => string;
