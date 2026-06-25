import Link from 'next/link';
import { Category } from '@/types';
import { BuildFilterHref, CategoryFilters } from '../categoryFilterSidebar.types';
import './_categoryFilterSection.scss';

type Props = {
    categories: Category[];
    filters: CategoryFilters;
    buildFilterHref: BuildFilterHref;
};

export const CategoryFilterSection = ({
    categories,
    filters,
    buildFilterHref,
}: Props) => (
    <>
        <div className="category-filter-section">
            <h2 className="category-filter-sidebar-title">Categoría</h2>
            <ul className="category-filter-sidebar-list">
                {categories.map((category) => (
                    <li key={category.id} className="category-filter-sidebar-item">
                        <Link
                            href={buildFilterHref(
                                {
                                    category: filters.category === category.slug
                                        ? undefined
                                        : category.slug,
                                },
                                { resetPrice: true }
                            )}
                            scroll={false}
                            className={`category-filter-sidebar-link ${filters.category === category.slug ? 'is-active' : ''}`}
                        >
                            {category.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>

        <div className="category-filter-section">
            <h2 className="category-filter-sidebar-title">Colección</h2>
            <ul className="category-filter-sidebar-list">
                <li className="category-filter-sidebar-item">
                    <Link
                        href={buildFilterHref(
                            { sort: filters.sort === 'newest' ? undefined : 'newest' },
                            { resetPrice: true }
                        )}
                        scroll={false}
                        className={`category-filter-sidebar-link ${filters.sort === 'newest' ? 'is-active' : ''}`}
                    >
                        Nuevos Ingresos
                    </Link>
                </li>
                <li className="category-filter-sidebar-item">
                    <Link
                        href={buildFilterHref(
                            { featured: filters.featured ? undefined : 'true' },
                            { resetPrice: true }
                        )}
                        scroll={false}
                        className={`category-filter-sidebar-link ${filters.featured ? 'is-active' : ''}`}
                    >
                        Destacados
                    </Link>
                </li>
                <li className="category-filter-sidebar-item">
                    <Link
                        href={buildFilterHref(
                            { sale: filters.sale ? undefined : 'true' },
                            { resetPrice: true }
                        )}
                        scroll={false}
                        className={`category-filter-sidebar-link ${filters.sale ? 'is-active' : ''}`}
                    >
                        Rebajas
                    </Link>
                </li>
            </ul>
        </div>
    </>
);
