import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

type SortValue = string | number | boolean | Date | null | undefined;

type SortColumn<T, K extends string> = {
    key: K;
    accessor: (item: T) => SortValue;
    defaultDirection?: SortDirection;
};

type SortState<K extends string> = {
    key: K;
    direction: SortDirection;
} | null;

type Props<T, K extends string> = {
    items: T[];
    columns: SortColumn<T, K>[];
    initialSort?: SortState<K>;
};

const compareValues = (a: SortValue, b: SortValue) => {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    const normalizedA = a instanceof Date ? a.getTime() : a;
    const normalizedB = b instanceof Date ? b.getTime() : b;

    if (typeof normalizedA === "string" && typeof normalizedB === "string") {
        return normalizedA.localeCompare(normalizedB, "es", {
            numeric: true,
            sensitivity: "base",
        });
    }

    if (typeof normalizedA === "boolean" && typeof normalizedB === "boolean") {
        return Number(normalizedA) - Number(normalizedB);
    }

    if (normalizedA < normalizedB) return -1;
    if (normalizedA > normalizedB) return 1;

    return 0;
};

export function useSortableTable<T, K extends string>({
    items,
    columns,
    initialSort = null,
}: Props<T, K>) {
    const [sortState, setSortState] = useState<SortState<K>>(initialSort);

    const sortedItems = useMemo(() => {
        if (!sortState) return items;

        const column = columns.find((item) => item.key === sortState.key);

        if (!column) return items;

        return items
            .map((item, index) => ({ item, index }))
            .sort((a, b) => {
                const result = compareValues(
                    column.accessor(a.item),
                    column.accessor(b.item)
                );
                const directionResult =
                    sortState.direction === "asc" ? result : -result;

                return directionResult || a.index - b.index;
            })
            .map(({ item }) => item);
    }, [columns, items, sortState]);

    const sortBy = (key: K) => {
        setSortState((current) => {
            if (current?.key === key) {
                return {
                    key,
                    direction: current.direction === "asc" ? "desc" : "asc",
                };
            }

            const column = columns.find((item) => item.key === key);

            return {
                key,
                direction: column?.defaultDirection ?? "asc",
            };
        });
    };

    const getSortDirection = (key: K) =>
        sortState?.key === key ? sortState.direction : null;

    return {
        sortedItems,
        sortState,
        sortBy,
        getSortDirection,
    };
}
