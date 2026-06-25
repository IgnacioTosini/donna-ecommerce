'use client'

import type { MouseEvent, RefObject } from "react";
import { IoMdClose } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";
import { HamburgerNavbar } from "../HamburgerNavbar/HamburgerNavbar";

type Props = {
    iconRef: RefObject<HTMLSpanElement | null>;
    isOpen: boolean;
    currentSection: string;
    onToggle: () => void;
    onSectionClick: (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => void;
};

export const NavbarMobileMenu = ({
    iconRef,
    isOpen,
    currentSection,
    onToggle,
    onSectionClick,
}: Props) => (
    <>
        <button
            type="button"
            className="hamburgerButton"
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            onClick={onToggle}
        >
            <span ref={iconRef}>
                {isOpen ? <IoMdClose size={26} /> : <RxHamburgerMenu size={26} />}
            </span>
        </button>

        <HamburgerNavbar
            id="mobile-navigation"
            isOpen={isOpen}
            onSectionClick={onSectionClick}
            activeSection={currentSection}
        />
    </>
);
