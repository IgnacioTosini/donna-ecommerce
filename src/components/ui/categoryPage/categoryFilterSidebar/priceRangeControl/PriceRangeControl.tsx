import './_priceRangeControl.scss';

const formatPrice = (price: number) => price.toLocaleString('es-AR');

type Props = {
    minPrice: number;
    maxAvailablePrice: number;
    selectedMaxPrice: number;
    onChange: (price: number) => void;
};

export const PriceRangeControl = ({
    minPrice,
    maxAvailablePrice,
    selectedMaxPrice,
    onChange,
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
                value={selectedMaxPrice}
                onChange={(event) => onChange(Number(event.target.value))}
                className="category-filter-sidebar-range"
                disabled={!hasPriceRange}
            />
            <div className="category-filter-price-labels">
                <span>${formatPrice(minPrice)}</span>
                <strong>Hasta ${formatPrice(selectedMaxPrice)}</strong>
                <span>${formatPrice(maxAvailablePrice)}</span>
            </div>
        </>
    );
};
