'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MouseEvent, useEffect, useRef, useState } from "react";
import gsap from 'gsap';
import { animateNavbarEntrance } from "./navbar.animations";
import { handleBrandNavigation, handleSectionNavigation, observeActiveSection, syncHashSectionOnRouteChange } from "@/utils/navigationHelpers";
import { useCartStore } from "@/store/cart.store";
import { NavbarActions } from "./NavbarActions";
import { NavbarLinks } from "./NavbarLinks";
import { NavbarMobileMenu } from "./NavbarMobileMenu";
import { NavbarSearch } from "./NavbarSearch";
import { useNavbarSearch } from "./useNavbarSearch";
import "./_navbar.scss";

interface Props {
    isAdmin: boolean;
}

export default function Navbar({ isAdmin }: Props) {
    const pathname = usePathname()
    const navbarRef = useRef<HTMLElement>(null)
    const iconRef = useRef<HTMLSpanElement>(null)
    const [isMobile, setIsMobile] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [activeSection, setActiveSection] = useState<string>('')
    const currentSection = pathname === '/' ? activeSection : '';
    const totalItems = useCartStore((state) => state.totalItems);
    const openCart = useCartStore((state) => state.openCart);
    const {
        searchInputRef,
        searchQuery,
        trimmedSearchQuery,
        searchResults,
        isSearching,
        searchError,
        handleSearchQueryChange,
        resetSearch,
    } = useNavbarSearch(isSearchOpen)

    useEffect(() => {
        if (!navbarRef.current) return;

        const ctx = gsap.context(() => {
            animateNavbarEntrance(navbarRef.current!);
        }, navbarRef.current);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (!iconRef.current) return;
        gsap.to(iconRef.current, {
            rotate: isMenuOpen ? 90 : 0,
            duration: 0.24,
            ease: 'power2.inOut',
        });
    }, [isMenuOpen]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768
            setIsMobile(mobile)
            if (!mobile) setIsMenuOpen(false)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        const handleOutsideClick = (event: globalThis.MouseEvent) => {
            if (!isSearchOpen || !navbarRef.current) return

            if (!navbarRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false)
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsSearchOpen(false)
            }
        }

        document.addEventListener('mousedown', handleOutsideClick)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isSearchOpen])

    const closeMobileMenu = () => {
        if (isMobile) setIsMenuOpen(false)
    }

    const closeSearch = () => {
        setIsSearchOpen(false)
        resetSearch()
    }

    const toggleSearch = () => {
        setIsSearchOpen((prev) => !prev)
        setIsMenuOpen(false)
    }

    const toggleMobileMenu = () => {
        closeSearch()
        setIsMenuOpen((prev) => !prev)
    }

    const handleBrandClick = (event: MouseEvent<HTMLAnchorElement>) => {
        handleBrandNavigation({
            event,
            pathname,
            onBeforeNavigate: () => {
                closeMobileMenu()
                closeSearch()
            },
        })
    }

    const handleSectionNavigationClick = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        handleSectionNavigation({
            event,
            pathname,
            sectionId,
            onBeforeNavigate: () => {
                closeMobileMenu()
                closeSearch()
            },
        })
    }

    useEffect(() => {
        syncHashSectionOnRouteChange()
    }, [pathname])

    useEffect(() => {
        if (pathname !== '/') return

        return observeActiveSection(setActiveSection)
    }, [pathname])

    return (
        <nav ref={navbarRef} className="navbar">
            {isMobile ? (
                <NavbarMobileMenu
                    iconRef={iconRef}
                    isOpen={isMenuOpen}
                    currentSection={currentSection}
                    onToggle={toggleMobileMenu}
                    onSectionClick={handleSectionNavigationClick}
                />
            ) : (
                <NavbarLinks
                    currentSection={currentSection}
                    onSectionClick={handleSectionNavigationClick}
                    onNavigate={() => {
                        closeMobileMenu()
                        closeSearch()
                    }}
                />
            )}
            <Link href="/" className="navbarBrand" onClick={handleBrandClick}>
                <h1 className="navbarBrandText">DONNA</h1>
            </Link>
            <NavbarActions
                pathname={pathname}
                currentSection={currentSection}
                isAdmin={isAdmin}
                isSearchOpen={isSearchOpen}
                totalItems={totalItems}
                onSearchClick={toggleSearch}
                onCartClick={openCart}
                onNavigate={() => {
                    closeMobileMenu()
                    closeSearch()
                }}
            />

            {isSearchOpen && (
                <NavbarSearch
                    inputRef={searchInputRef}
                    query={searchQuery}
                    trimmedQuery={trimmedSearchQuery}
                    results={searchResults}
                    isSearching={isSearching}
                    error={searchError}
                    onQueryChange={handleSearchQueryChange}
                    onResultClick={() => {
                        closeMobileMenu()
                        closeSearch()
                    }}
                />
            )}
        </nav>
    )
}
