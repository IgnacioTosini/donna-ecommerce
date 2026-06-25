import Link from 'next/link';
import { BuildFilterHref, CategoryFilters } from '../categoryFilterSidebar.types';
import './_sizeFilterSection.scss';

type Props = {
    sizes: string[];
    filters?: CategoryFilters;
    buildFilterHref?: BuildFilterHref;
    selectedSize?: string;
    disabledSizes?: string[];
    onSelectSize?: (size: string) => void;
};

export const SizeFilterSection = ({
    sizes,
    filters = {},
    buildFilterHref,
    selectedSize,
    disabledSizes = [],
    onSelectSize,
}: Props) => {
    const disabledSizeSet = new Set(disabledSizes);
    const activeSize = selectedSize ?? filters.size;

    return (
        <div className="category-filter-section">
            <h2 className="category-filter-sidebar-title">Talla</h2>
            <ul className="category-filter-size-list">
                {sizes.map((size) => {
                    const isActive = activeSize === size;
                    const isDisabled = disabledSizeSet.has(size);
                    const className = `category-filter-size ${isActive ? 'is-active' : ''}`;

                    return (
                        <li key={size}>
                            {buildFilterHref ? (
                                <Link
                                    href={buildFilterHref(
                                        { size: filters.size === size ? undefined : size },
                                        { resetPrice: true }
                                    )}
                                    className={className}
                                    aria-current={isActive ? 'true' : undefined}
                                >
                                    {size}
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    className={className}
                                    disabled={isDisabled}
                                    aria-pressed={isActive}
                                    onClick={() => onSelectSize?.(size)}
                                >
                                    {size}
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
