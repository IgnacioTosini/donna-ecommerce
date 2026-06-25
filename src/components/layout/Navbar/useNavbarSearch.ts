'use client'

import { useEffect, useRef, useState } from "react";
import type { SearchProduct } from "./navbar.types";

export const useNavbarSearch = (isSearchOpen: boolean) => {
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchProduct[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [searchError, setSearchError] = useState('')
    const trimmedSearchQuery = searchQuery.trim()

    useEffect(() => {
        if (!isSearchOpen) return

        searchInputRef.current?.focus()
    }, [isSearchOpen])

    useEffect(() => {
        if (!isSearchOpen || !trimmedSearchQuery) return

        const controller = new AbortController()
        const timeoutId = window.setTimeout(async () => {
            setIsSearching(true)
            setSearchError('')

            try {
                const response = await fetch(`/api/products/search?q=${encodeURIComponent(trimmedSearchQuery)}`, {
                    signal: controller.signal,
                })

                if (!response.ok) {
                    throw new Error('No se pudo buscar productos')
                }

                const data = await response.json() as { products?: SearchProduct[] }
                setSearchResults(data.products ?? [])
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') return

                setSearchError('No pudimos cargar los resultados.')
                setSearchResults([])
            } finally {
                if (!controller.signal.aborted) {
                    setIsSearching(false)
                }
            }
        }, 250)

        return () => {
            controller.abort()
            window.clearTimeout(timeoutId)
        }
    }, [isSearchOpen, trimmedSearchQuery])

    const resetSearch = () => {
        setSearchQuery('')
        setSearchResults([])
        setSearchError('')
        setIsSearching(false)
    }

    const handleSearchQueryChange = (value: string) => {
        setSearchQuery(value)
        setSearchResults([])
        setSearchError('')
        setIsSearching(Boolean(value.trim()))
    }

    return {
        searchInputRef,
        searchQuery,
        trimmedSearchQuery,
        searchResults,
        isSearching,
        searchError,
        handleSearchQueryChange,
        resetSearch,
    }
};
