'use client'

import Link from "next/link";
import type { MouseEvent } from "react";
import { navigationItems } from "@/utils/navigationItems";

type Props = {
    currentSection: string;
    onSectionClick: (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => void;
    onNavigate: () => void;
};

export const NavbarLinks = ({ currentSection, onSectionClick, onNavigate }: Props) => (
    <div className="navbarLinks">
        {navigationItems.map(({ id, label, href, sectionId }) => (
            <Link
                key={id}
                href={href}
                className={`navbarLink ${sectionId && currentSection === sectionId ? 'active' : ''}`}
                aria-current={sectionId && currentSection === sectionId ? 'page' : undefined}
                onClick={(event) => {
                    if (sectionId) {
                        onSectionClick(event, sectionId)
                        return
                    }

                    onNavigate()
                }}
            >
                {label}
            </Link>
        ))}
    </div>
);
