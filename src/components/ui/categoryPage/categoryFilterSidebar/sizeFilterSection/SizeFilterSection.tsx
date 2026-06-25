import Link from 'next/link';
import { BuildFilterHref, CategoryFilters } from '../categoryFilterSidebar.types';
import { normalizeSizeValue, sizesMatch } from '@/utils/sizeHelpers';
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
    const disabledSizeSet = new Set(disabledSizes.map(normalizeSizeValue));
    const activeSize = selectedSize ?? filters.size;

    return (
        <div className="category-filter-section">
            <h2 className="category-filter-sidebar-title">Talla</h2>
            <ul className="category-filter-size-list">
                {sizes.map((size) => {
                    const normalizedSize = normalizeSizeValue(size) ?? size;
                    const isActive = sizesMatch(activeSize, size);
                    const isDisabled = disabledSizeSet.has(normalizedSize);
                    const className = `category-filter-size ${isActive ? 'is-active' : ''}`;

                    return (
                        <li key={size}>
                            {buildFilterHref ? (
                                <Link
                                    href={buildFilterHref(
                                        { size: sizesMatch(filters.size, size) ? undefined : normalizedSize },
                                        { resetPrice: true }
                                    )}
                                    scroll={false}
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
