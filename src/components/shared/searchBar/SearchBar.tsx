'use client';

import './_searchBar.scss';

interface Props {
    query: string;
    onChange: (query: string) => void;
    placeholder?: string;
}

export const SearchBar = ({
    query,
    onChange,
    placeholder = 'Buscar...',
}: Props) => {
    return (
        <div className="search-bar">
            <span>⌕</span>

            <input
                placeholder={placeholder}
                value={query}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};