import { useMemo, useState } from 'react';

export function useSearch<T>(
    items: T[],
    searchFn: (item: T, query: string) => boolean
) {
    const [query, setQuery] = useState('');

    const filteredItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) return items;

        return items.filter((item) =>
            searchFn(item, normalizedQuery)
        );
    }, [items, query, searchFn]);

    return {
        query,
        setQuery,
        filteredItems,
    };
}