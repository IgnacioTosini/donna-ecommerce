export type CategoryFilters = {
    category?: string;
    gender?: string;
    size?: string;
    color?: string;
    maxPrice?: string;
    featured?: string;
    sale?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
};

export type BuildFilterHref = (
    nextFilters: Partial<CategoryFilters>,
    options?: { resetPrice?: boolean }
) => string;
