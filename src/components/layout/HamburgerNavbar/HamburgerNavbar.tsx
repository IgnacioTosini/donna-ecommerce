"use client";

import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { animateHamburgerMenuOpen } from './hamburgerNavbar.animations';
import { navigationItems } from '@/utils/navigationItems';
import './_hamburgerNavbar.scss';

type HamburgerNavbarProps = {
    id: string;
    isOpen: boolean;
    onSectionClick: (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => void;
    activeSection: string;
};

export const HamburgerNavbar = ({ id, isOpen, onSectionClick, activeSection }: HamburgerNavbarProps) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuActiveSection, setMenuActiveSection] = useState(activeSection);

    // Run animation when the menu div actually mounts (isOpen becomes true)
    useEffect(() => {
        if (!isOpen || !menuRef.current) return;

        const ctx = gsap.context(() => {
            animateHamburgerMenuOpen(menuRef.current!);
        }, menuRef.current);

        return () => ctx.revert();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const sections = navigationItems
            .filter((item) => Boolean(item.sectionId))
            .map((item) => document.getElementById(item.sectionId!))
            .filter((section): section is HTMLElement => section !== null);

        if (sections.length === 0) {
            const rafId = requestAnimationFrame(() => setMenuActiveSection(activeSection));
            return () => cancelAnimationFrame(rafId);
        }

        const updateMenuActiveSection = () => {
            const menuBottom = menuRef.current?.getBoundingClientRect().bottom ?? 0;
            const markerViewportY = menuBottom + 12;
            const markerDocumentY = window.scrollY + markerViewportY;
            const sectionTops = sections.map((section) => section.getBoundingClientRect().top + window.scrollY);

            if (markerDocumentY < sectionTops[0]) {
                setMenuActiveSection('');
                return;
            }

            const currentIndex = sectionTops.reduce((activeIndex, top, index) => {
                if (markerDocumentY >= top) return index;
                return activeIndex;
            }, 0);

            setMenuActiveSection(sections[currentIndex]?.id ?? '');
        };

        const rafId = requestAnimationFrame(updateMenuActiveSection);
        window.addEventListener('scroll', updateMenuActiveSection, { passive: true });
        window.addEventListener('resize', updateMenuActiveSection);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('scroll', updateMenuActiveSection);
            window.removeEventListener('resize', updateMenuActiveSection);
        };
    }, [isOpen, activeSection]);

    if (!isOpen) return null;

    return (
        <div ref={menuRef} id={id} className="hamburgerNavbar">
            {navigationItems.map(({ id, label, href, sectionId }) => (
                <Link
                    key={id}
                    href={href}
                    className={sectionId && menuActiveSection === sectionId ? 'active' : ''}
                    aria-current={sectionId && menuActiveSection === sectionId ? 'page' : undefined}
                    onClick={(event) => {
                        if (sectionId) {
                            onSectionClick(event, sectionId);
                        }
                    }}
                >
                    {label}
                </Link>
            ))}
        </div>
    );
};
