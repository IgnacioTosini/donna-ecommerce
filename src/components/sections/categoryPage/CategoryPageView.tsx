import { Category, ProductWithRelations } from "@/types";
import { CategoryHeader } from "@/components/ui/categoryPage/categoryHeader/CategoryHeader";
import { CategoryFilterSidebar } from "@/components/ui/categoryPage/categoryFilterSidebar/CategoryFilterSidebar";
import { ProductsGrid } from "@/components/shared/productsGrid/ProductsGrid";
import './_categoryPageView.scss';

type CategoryFilters = {
    category?: string;
    size?: string;
    color?: string;
    maxPrice?: string;
    featured?: string;
    sale?: string;
    sort?: string;
};

type Props = {
    categories: Category[];
    products: ProductWithRelations[];
    productsForFilters: ProductWithRelations[];
    productsForPriceRange: ProductWithRelations[];
    filters: CategoryFilters;
};

export const CategoryPageView = ({
    categories,
    products,
    productsForFilters,
    productsForPriceRange,
    filters,
}: Props) => {
    const activeCategory = categories.find(
        (category) => category.slug === filters.category
    );

    return (
        <main className="category-page">
            <CategoryHeader activeCategory={activeCategory} />
            <div className="category-page-content">
                <CategoryFilterSidebar
                    categories={categories}
                    products={productsForFilters}
                    priceProducts={productsForPriceRange}
                    filters={filters}
                />
                <ProductsGrid
                    products={products}
                    filters={{
                        color: filters.color,
                        size: filters.size,
                    }}
                />
            </div>
        </main>
    );
};
