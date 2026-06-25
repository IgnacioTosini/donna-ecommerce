export const PRODUCT_SIZE_ORDER = [
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    '3XL',
    'Único',
] as const;

const getSizeKey = (size: string) =>
    size
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();

const canonicalSizesByKey = new Map(
    PRODUCT_SIZE_ORDER.map((size) => [getSizeKey(size), size])
);

export const normalizeSizeValue = (size?: string | null) => {
    const trimmedSize = size?.trim();

    if (!trimmedSize) return undefined;

    return canonicalSizesByKey.get(getSizeKey(trimmedSize)) ?? trimmedSize;
};

export const sizesMatch = (
    firstSize?: string | null,
    secondSize?: string | null
) => {
    const normalizedFirstSize = normalizeSizeValue(firstSize);
    const normalizedSecondSize = normalizeSizeValue(secondSize);

    return Boolean(
        normalizedFirstSize &&
        normalizedSecondSize &&
        normalizedFirstSize === normalizedSecondSize
    );
};

export const sortProductSizes = (sizes: string[]) =>
    [...sizes].sort((firstSize, secondSize) => {
        const firstIndex = PRODUCT_SIZE_ORDER.indexOf(
            normalizeSizeValue(firstSize) as typeof PRODUCT_SIZE_ORDER[number]
        );
        const secondIndex = PRODUCT_SIZE_ORDER.indexOf(
            normalizeSizeValue(secondSize) as typeof PRODUCT_SIZE_ORDER[number]
        );

        if (firstIndex === -1 && secondIndex === -1) {
            return firstSize.localeCompare(secondSize);
        }

        if (firstIndex === -1) return 1;
        if (secondIndex === -1) return -1;

        return firstIndex - secondIndex;
    });
