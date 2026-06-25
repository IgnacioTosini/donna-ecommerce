'use client'

import Link from "next/link";
import { FaUserSecret } from "react-icons/fa";
import { navigationIcons } from "@/utils/navigationItems";

type Props = {
    pathname: string;
    currentSection: string;
    isAdmin: boolean;
    isSearchOpen: boolean;
    totalItems: number;
    onSearchClick: () => void;
    onCartClick: () => void;
    onNavigate: () => void;
};

export const NavbarActions = ({
    pathname,
    currentSection,
    isAdmin,
    isSearchOpen,
    totalItems,
    onSearchClick,
    onCartClick,
    onNavigate,
}: Props) => (
    <div className="navbarIcons">
        {navigationIcons.map(({ id, icon: Icon, href }) => {
            if (id === 'search') {
                return (
                    <button
                        key={id}
                        type="button"
                        className={`navbarIcon navbarIconButton ${isSearchOpen ? 'active' : ''}`}
                        aria-label={isSearchOpen ? 'Cerrar buscador' : 'Abrir buscador'}
                        aria-expanded={isSearchOpen}
                        aria-controls="navbar-search"
                        onClick={onSearchClick}
                    >
                        <Icon />
                    </button>
                )
            }

            return (
                <Link
                    key={id}
                    href={href}
                    className={`navbarIcon ${currentSection === id ? 'active' : ''}`}
                    aria-current={currentSection === id ? 'page' : undefined}
                    onClick={(event) => {
                        if (id === 'cart') {
                            event.preventDefault()
                            onCartClick()
                        }

                        onNavigate()
                    }}
                >
                    <Icon />
                    {id === 'cart' && totalItems > 0 && <span className="cartBadge">{totalItems}</span>}
                </Link>
            )
        })}

        {isAdmin && (
            <Link
                href="/admin"
                className={`navbarIcon ${pathname === '/admin' ? 'active' : ''}`}
                aria-current={pathname === '/admin' ? 'page' : undefined}
                onClick={onNavigate}
            >
                <span className="adminIcon"><FaUserSecret /></span>
            </Link>
        )}
    </div>
);
