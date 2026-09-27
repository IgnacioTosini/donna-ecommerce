import { CategoryFilters } from '../categoryFilterSidebar.types';
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
    onChange: (filters: Partial<CategoryFilters>) => void;
};

export const GenderFilterSection = ({
    filters,
    onChange,
}: Props) => (
    <div className="category-filter-section">
        <h2 className="category-filter-sidebar-title">Género</h2>
        <ul className="category-filter-sidebar-list">
            {genderOptions.map((gender) => (
                <li key={gender.value} className="category-filter-sidebar-item">
                    <button
                        type="button"
                        onClick={() => onChange(
                            {
                                gender: filters.gender === gender.value
                                    ? undefined
                                    : gender.value,
                            }
                        )}
                        aria-pressed={filters.gender === gender.value}
                        className={`category-filter-sidebar-link ${filters.gender === gender.value ? 'is-active' : ''}`}
                    >
                        {gender.label}
                    </button>
                </li>
            ))}
        </ul>
    </div>
);
