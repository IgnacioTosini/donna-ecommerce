import type { MouseEvent } from "react";
import { navigationItems } from "@/utils/navigationItems";
import { scrollSection } from "@/utils/scrollSection";

type AnchorClickEvent = MouseEvent<HTMLAnchorElement>;

type SectionNavigationParams = {
    event: AnchorClickEvent;
    pathname: string;
    sectionId: string;
    onBeforeNavigate?: () => void;
};

type BrandNavigationParams = {
    event: AnchorClickEvent;
    pathname: string;
    onBeforeNavigate?: () => void;
};

export const handleSectionNavigation = ({ event, pathname, sectionId, onBeforeNavigate }: SectionNavigationParams) => {
    onBeforeNavigate?.();

    if (pathname === "/" && scrollSection(sectionId)) {
        event.preventDefault();
    }
};

export const handleBrandNavigation = ({ event, pathname, onBeforeNavigate }: BrandNavigationParams) => {
    onBeforeNavigate?.();

    if (pathname === "/") {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.replaceState(null, "", "/");
    }
};

export const syncHashSectionOnRouteChange = () => {
    const hashSection = window.location.hash.replace("#", "");

    if (!hashSection) return;

    requestAnimationFrame(() => {
        scrollSection(hashSection);
    });
};

export const observeActiveSection = (setActiveSection: (section: string) => void) => {
    const sectionElements = navigationItems
        .filter((item) => Boolean(item.sectionId))
        .map((item) => document.getElementById(item.sectionId!))
        .filter((section): section is HTMLElement => section !== null);

    if (sectionElements.length === 0) return () => undefined;

    const updateActiveSection = () => {
        const markerRatio = window.innerWidth <= 768 ? 0.2 : 0.35;
        const markerViewportY = window.innerHeight * markerRatio;
        const markerDocumentY = window.scrollY + markerViewportY;
        const sectionTops = sectionElements.map((section) => section.getBoundingClientRect().top + window.scrollY);
        const firstSectionTop = sectionTops[0];

        if (markerDocumentY < firstSectionTop) {
            setActiveSection("");
            return;
        }

        const currentIndex = sectionTops.reduce((activeIndex, top, index) => {
            if (markerDocumentY >= top) return index;
            return activeIndex;
        }, 0);

        const current = sectionElements[currentIndex];

        if (current) {
            setActiveSection(current.id);
            return;
        }

        const nearest = [...sectionElements].sort(
            (a, b) => Math.abs(a.getBoundingClientRect().top - markerViewportY) - Math.abs(b.getBoundingClientRect().top - markerViewportY)
        )[0];

        setActiveSection(nearest?.id ?? "");
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
        window.removeEventListener("scroll", updateActiveSection);
        window.removeEventListener("resize", updateActiveSection);
    };
};