'use client'

import Image from "next/image";
import Link from "next/link";
import type { RefObject } from "react";
import type { SearchProduct } from "./navbar.types";

type Props = {
    inputRef: RefObject<HTMLInputElement | null>;
    query: string;
    trimmedQuery: string;
    results: SearchProduct[];
    isSearching: boolean;
    error: string;
    onQueryChange: (value: string) => void;
    onResultClick: () => void;
};

export const NavbarSearch = ({
    inputRef,
    query,
    trimmedQuery,
    results,
    isSearching,
    error,
    onQueryChange,
    onResultClick,
}: Props) => (
    <div className="navbarSearchPanel" id="navbar-search">
        <div className="navbarSearchBox">
            <input
                ref={inputRef}
                type="search"
                value={query}
                className="navbarSearchInput"
                placeholder="Buscar productos"
                aria-label="Buscar productos"
                onChange={(event) => onQueryChange(event.target.value)}
            />

            <div className="navbarSearchResults" role="listbox" aria-label="Resultados de búsqueda">
                {!trimmedQuery && (
                    <p className="navbarSearchMessage">Escribí para encontrar productos.</p>
                )}

                {trimmedQuery && isSearching && (
                    <p className="navbarSearchMessage">Buscando...</p>
                )}

                {trimmedQuery && error && (
                    <p className="navbarSearchMessage">{error}</p>
                )}

                {trimmedQuery && !isSearching && !error && results.length === 0 && (
                    <p className="navbarSearchMessage">No encontramos productos.</p>
                )}

                {trimmedQuery && !isSearching && !error && results.map((product) => (
                    <Link
                        key={product.id}
                        href={`/producto/${product.slug}`}
                        className="navbarSearchResult"
                        role="option"
                        onClick={onResultClick}
                    >
                        <span className="navbarSearchImage">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    sizes="56px"
                                />
                            ) : (
                                <span className="navbarSearchImagePlaceholder" />
                            )}
                        </span>
                        <span className="navbarSearchInfo">
                            <span className="navbarSearchCategory">{product.categoryName}</span>
                            <span className="navbarSearchName">{product.name}</span>
                        </span>
                        <span className="navbarSearchPrice">${product.price}</span>
                    </Link>
                ))}
            </div>
        </div>
    </div>
);
