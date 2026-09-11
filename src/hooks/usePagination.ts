import { useCallback, useMemo, useState } from 'react';

export function usePagination<T>(items: T[], initialPageSize = 10) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSizeState] = useState(initialPageSize);
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

    const safePage = Math.min(currentPage, totalPages);

    const paginatedItems = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [items, pageSize, safePage]);

    const setPageSize = (size: number) => {
        setPageSizeState(size);
        setCurrentPage(1);
    };
    const resetPage = useCallback(() => setCurrentPage(1), []);

    return {
        currentPage: safePage,
        pageSize,
        totalPages,
        totalItems: items.length,
        paginatedItems,
        setCurrentPage: (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages))),
        setPageSize,
        resetPage,
    };
}
