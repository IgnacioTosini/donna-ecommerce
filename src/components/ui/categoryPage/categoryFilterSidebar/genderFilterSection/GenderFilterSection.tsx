import Link from 'next/link';
import { BuildFilterHref, CategoryFilters } from '../categoryFilterSidebar.types';
import '../categoryFilterSection/_categoryFilterSection.scss';

const genderOptions = [
    {
        label: 'Mujer',
        value: 'WOMEN',
    },
    {
        label: 'Hombre',
        value: 'MEN',
    },
    {
        label: 'Unisex',
        value: 'UNISEX',
    },
] as const;

type Props = {
    filters: CategoryFilters;
    buildFilterHref: BuildFilterHref;
};

export const GenderFilterSection = ({
    filters,
    buildFilterHref,
}: Props) => (
    <div className="category-filter-section">
        <h2 className="category-filter-sidebar-title">Género</h2>
        <ul className="category-filter-sidebar-list">
            {genderOptions.map((gender) => (
                <li key={gender.value} className="category-filter-sidebar-item">
                    <Link
                        href={buildFilterHref(
                            {
                                gender: filters.gender === gender.value
                                    ? undefined
                                    : gender.value,
                            },
                            { resetPrice: true }
                        )}
                        scroll={false}
                        className={`category-filter-sidebar-link ${filters.gender === gender.value ? 'is-active' : ''}`}
                    >
                        {gender.label}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
);
