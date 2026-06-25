import Link from 'next/link';
import { BuildFilterHref, CategoryFilters } from '../categoryFilterSidebar.types';
import './_colorFilterSection.scss';

type Props = {
    colors: string[];
    filters?: CategoryFilters;
    buildFilterHref?: BuildFilterHref;
    selectedColor?: string;
    disabledColors?: string[];
    onSelectColor?: (color: string) => void;
};

export const ColorFilterSection = ({
    colors,
    filters = {},
    buildFilterHref,
    selectedColor,
    disabledColors = [],
    onSelectColor,
}: Props) => {
    const disabledColorSet = new Set(disabledColors);
    const activeColor = selectedColor ?? filters.color;

    return (
        <div className="category-filter-section">
            <h2 className="category-filter-sidebar-title">Color</h2>
            <ul className="category-filter-color-list">
                {colors.map((color) => {
                    const isActive = activeColor === color;
                    const isDisabled = disabledColorSet.has(color);
                    const className = `category-filter-color ${isActive ? 'is-active' : ''}`;

                    return (
                        <li key={color}>
                            {buildFilterHref ? (
                                <Link
                                    href={buildFilterHref(
                                        { color: filters.color === color ? undefined : color },
                                        { resetPrice: true }
                                    )}
                                    className={className}
                                    aria-label={`Filtrar por color ${color}`}
                                    aria-current={isActive ? 'true' : undefined}
                                >
                                    <span
                                        className="color-swatch"
                                        style={{ backgroundColor: color }}
                                    />
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    className={className}
                                    disabled={isDisabled}
                                    aria-label={`Seleccionar color ${color}`}
                                    aria-pressed={isActive}
                                    onClick={() => onSelectColor?.(color)}
                                >
                                    <span
                                        className="color-swatch"
                                        style={{ backgroundColor: color }}
                                    />
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
