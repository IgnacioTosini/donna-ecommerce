import { ReactNode } from 'react';
import { FiX } from 'react-icons/fi';

type Props = {
    isOpen: boolean;
    activeFilterCount: number;
    children: ReactNode;
    onClose: () => void;
    onApply: () => void;
    onClear: () => void;
};

export const CategoryFilterMobileSheet = ({
    isOpen,
    activeFilterCount,
    children,
    onClose,
    onApply,
    onClear,
}: Props) => (
    <div className={`category-filter-mobile-sheet ${isOpen ? 'is-open' : ''}`}>
        <button
            type="button"
            className="category-filter-mobile-backdrop"
            aria-label="Cerrar filtros"
            onClick={onClose}
        />
        <aside
            className="category-filter-sidebar category-filter-sidebar-panel"
            role="dialog"
            aria-modal="true"
            aria-hidden={!isOpen}
            aria-label="Filtros"
        >
            <div className="category-filter-sheet-header">
                <div>
                    <span>Filtros</span>
                    {activeFilterCount > 0 && (
                        <strong>{activeFilterCount} activos</strong>
                    )}
                </div>
                <button
                    type="button"
                    className="category-filter-sheet-close"
                    aria-label="Cerrar filtros"
                    onClick={onClose}
                >
                    <FiX aria-hidden="true" />
                </button>
            </div>

            <div className="category-filter-sheet-body">
                {children}
            </div>

            <div className="category-filter-sheet-footer">
                <button
                    type="button"
                    className="category-filter-clear-button"
                    onClick={onClear}
                >
                    Limpiar
                </button>
                <button
                    type="button"
                    className="category-filter-view-button"
                    onClick={onApply}
                >
                    Aplicar filtros
                </button>
            </div>
        </aside>
    </div>
);
