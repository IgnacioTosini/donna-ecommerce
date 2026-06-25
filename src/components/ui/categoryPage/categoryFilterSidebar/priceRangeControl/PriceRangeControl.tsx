import './_priceRangeControl.scss';

const formatPrice = (price: number) => price.toLocaleString('es-AR');

type Props = {
    minPrice: number;
    maxAvailablePrice: number;
    selectedMaxPrice: number;
};

export const PriceRangeControl = ({
    minPrice,
    maxAvailablePrice,
    selectedMaxPrice,
}: Props) => {
    const hasPriceRange = maxAvailablePrice > 0;

    return (
        <>
            <input
                type="range"
                name="maxPrice"
                min={minPrice}
                max={maxAvailablePrice}
                step="1"
                defaultValue={selectedMaxPrice}
                className="category-filter-sidebar-range"
                disabled={!hasPriceRange}
            />
            <div className="category-filter-price-labels">
                <span>${formatPrice(minPrice)}</span>
                <strong>Hasta ${formatPrice(selectedMaxPrice)}</strong>
                <span>${formatPrice(maxAvailablePrice)}</span>
            </div>
            <button
                type="submit"
                className="category-filter-price-button"
                disabled={!hasPriceRange}
            >
                Aplicar
            </button>
        </>
    );
};
