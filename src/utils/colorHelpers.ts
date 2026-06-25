export const normalizeColorValue = (color?: string | null) => {
    const trimmedColor = color?.trim();

    if (!trimmedColor) return undefined;

    return trimmedColor.toLowerCase();
};

export const colorsMatch = (
    firstColor?: string | null,
    secondColor?: string | null
) => {
    const normalizedFirstColor = normalizeColorValue(firstColor);
    const normalizedSecondColor = normalizeColorValue(secondColor);

    return Boolean(
        normalizedFirstColor &&
        normalizedSecondColor &&
        normalizedFirstColor === normalizedSecondColor
    );
};
