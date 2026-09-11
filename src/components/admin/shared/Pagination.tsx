import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import './_pagination.scss';

type Props = {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
};

const getVisiblePages = (current: number, total: number) => {
    const start = Math.max(1, Math.min(current - 1, total - 2));
    return Array.from({ length: Math.min(3, total) }, (_, index) => start + index);
};

export function Pagination({ currentPage, pageSize, totalItems, totalPages, onPageChange, onPageSizeChange }: Props) {
    if (totalItems === 0) return null;
    const firstItem = (currentPage - 1) * pageSize + 1;
    const lastItem = Math.min(currentPage * pageSize, totalItems);

    return <nav className="admin-pagination" aria-label="Paginación de resultados">
        <p><strong>{firstItem}–{lastItem}</strong> de {totalItems}</p>
        <div className="admin-pagination-pages">
            <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} aria-label="Página anterior"><IoChevronBack /></button>
            {getVisiblePages(currentPage, totalPages).map(page => <button type="button" key={page} className={page === currentPage ? 'active' : ''} aria-current={page === currentPage ? 'page' : undefined} onClick={() => onPageChange(page)}>{page}</button>)}
            <button type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} aria-label="Página siguiente"><IoChevronForward /></button>
        </div>
        <label>Mostrar<select value={pageSize} onChange={event => onPageSizeChange(Number(event.target.value))}>
            <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
        </select></label>
    </nav>;
}
