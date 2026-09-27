import { Category } from '@/types';
import { CategoryFilters } from '../categoryFilterSidebar.types';
import './_categoryFilterSection.scss';

type Props = {
    categories: Category[];
    filters: CategoryFilters;
    onChange: (filters: Partial<CategoryFilters>) => void;
};

export const CategoryFilterSection = ({
    categories,
    filters,
    onChange,
}: Props) => (
    <>
        <div className="category-filter-section">
            <h2 className="category-filter-sidebar-title">Categoría</h2>
            <ul className="category-filter-sidebar-list">
                {categories.map((category) => (
                    <li key={category.id} className="category-filter-sidebar-item">
                        <button
                            type="button"
                            onClick={() => onChange(
                                {
                                    category: filters.category === category.slug
                                        ? undefined
                                        : category.slug,
                                }
                            )}
                            aria-pressed={filters.category === category.slug}
                            className={`category-filter-sidebar-link ${filters.category === category.slug ? 'is-active' : ''}`}
                        >
                            {category.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>

        <div className="category-filter-section">
            <h2 className="category-filter-sidebar-title">Colección</h2>
            <ul className="category-filter-sidebar-list">
                <li className="category-filter-sidebar-item">
                    <button
                        type="button"
                        onClick={() => onChange(
                            { sort: filters.sort === 'newest' ? undefined : 'newest' }
                        )}
                        aria-pressed={filters.sort === 'newest'}
                        className={`category-filter-sidebar-link ${filters.sort === 'newest' ? 'is-active' : ''}`}
                    >
                        Nuevos Ingresos
                    </button>
                </li>
                <li className="category-filter-sidebar-item">
                    <button
                        type="button"
                        onClick={() => onChange(
                            { featured: filters.featured ? undefined : 'true' }
                        )}
                        aria-pressed={Boolean(filters.featured)}
                        className={`category-filter-sidebar-link ${filters.featured ? 'is-active' : ''}`}
                    >
                        Destacados
                    </button>
                </li>
                <li className="category-filter-sidebar-item">
                    <button
                        type="button"
                        onClick={() => onChange(
                            { sale: filters.sale ? undefined : 'true' }
                        )}
                        aria-pressed={Boolean(filters.sale)}
                        className={`category-filter-sidebar-link ${filters.sale ? 'is-active' : ''}`}
                    >
                        Rebajas
                    </button>
                </li>
            </ul>
        </div>
    </>
);
