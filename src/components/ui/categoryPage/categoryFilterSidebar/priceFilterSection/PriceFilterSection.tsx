'use client';

import { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryFilters } from '../categoryFilterSidebar.types';
import { PriceRangeControl } from '../priceRangeControl/PriceRangeControl';
import './_priceFilterSection.scss';

type Props = {
    filters: CategoryFilters;
    minPrice: number;
    maxAvailablePrice: number;
    selectedMaxPrice: number;
    onApply?: () => void;
};

export const PriceFilterSection = ({
    filters,
    minPrice,
    maxAvailablePrice,
    selectedMaxPrice,
    onApply,
}: Props) => {
    const router = useRouter();

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const params = new URLSearchParams();

        formData.forEach((value, key) => {
            const stringValue = String(value);

            if (stringValue) {
                params.set(key, stringValue);
            }
        });

        const queryString = params.toString();

        router.push(queryString ? `/categoria?${queryString}` : '/categoria', {
            scroll: false,
        });
        onApply?.();
    };

    return (
        <div className="category-filter-section">
            <h2 className="category-filter-sidebar-title">Precio Máximo</h2>
            <form className="category-filter-price" action="/categoria" onSubmit={handleSubmit}>
                {filters.category && (
                    <input type="hidden" name="category" value={filters.category} />
                )}
                {filters.gender && (
                    <input type="hidden" name="gender" value={filters.gender} />
                )}
                {filters.size && (
                    <input type="hidden" name="size" value={filters.size} />
                )}
                {filters.color && (
                    <input type="hidden" name="color" value={filters.color} />
                )}
                {filters.sort && (
                    <input type="hidden" name="sort" value={filters.sort} />
                )}
                {filters.featured && (
                    <input type="hidden" name="featured" value={filters.featured} />
                )}
                {filters.sale && (
                    <input type="hidden" name="sale" value={filters.sale} />
                )}
                <PriceRangeControl
                    key={`${minPrice}-${maxAvailablePrice}-${selectedMaxPrice}`}
                    minPrice={minPrice}
                    maxAvailablePrice={maxAvailablePrice}
                    selectedMaxPrice={selectedMaxPrice}
                />
            </form>
        </div>
    );
};
