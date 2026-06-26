import Link from 'next/link';
import { FiFilter, FiX } from 'react-icons/fi';
import { CategoryFilterChip } from './categoryFilterChips';

type Props = {
    isOpen: boolean;
    activeFilterChips: CategoryFilterChip[];
    onOpen: () => void;
};

export const CategoryFilterMobileBar = ({
    isOpen,
    activeFilterChips,
    onOpen,
}: Props) => {
    const activeFilterCount = activeFilterChips.length;

    return (
        <div className="category-filter-mobile-bar">
            <button
                type="button"
                className="category-filter-mobile-trigger"
                onClick={onOpen}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            >
                <FiFilter aria-hidden="true" />
                <span>Filtros</span>
                {activeFilterCount > 0 && (
                    <strong>{activeFilterCount}</strong>
                )}
            </button>

            {activeFilterChips.length > 0 && (
                <div className="category-filter-active-chips" aria-label="Filtros activos">
                    {activeFilterChips.map((chip) => (
                        <Link
                            key={`${chip.label}-${chip.href}`}
                            href={chip.href}
                            scroll={false}
                            className="category-filter-active-chip"
                        >
                            {chip.label}
                            <FiX aria-hidden="true" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
