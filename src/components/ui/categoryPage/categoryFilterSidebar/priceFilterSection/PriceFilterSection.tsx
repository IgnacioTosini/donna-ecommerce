import { PriceRangeControl } from '../priceRangeControl/PriceRangeControl';
import './_priceFilterSection.scss';

type Props = {
    minPrice: number;
    maxAvailablePrice: number;
    selectedMaxPrice: number;
    onChange: (price: number) => void;
};

export const PriceFilterSection = (props: Props) => (
    <div className="category-filter-section">
        <h2 className="category-filter-sidebar-title">Precio Máximo</h2>
        <div className="category-filter-price">
            <PriceRangeControl {...props} />
        </div>
    </div>
);
