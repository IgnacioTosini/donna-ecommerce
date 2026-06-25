import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let scrollTriggerRegistered = false;

const registerScrollTrigger = () => {
    if (scrollTriggerRegistered) return;

    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
};

const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealDefaults = {
    duration: 0.85,
    ease: "power3.out",
};

export const animateSectionReveal = (
    section: HTMLElement,
    itemSelector: string,
    options: {
        trigger?: HTMLElement;
        start?: string;
        y?: number;
        stagger?: number;
        delay?: number;
    } = {}
) => {
    const items = section.querySelectorAll(itemSelector);

    if (!items.length || prefersReducedMotion()) return;

    registerScrollTrigger();

    gsap.fromTo(
        items,
        {
            y: options.y ?? 28,
            opacity: 0,
        },
        {
            y: 0,
            opacity: 1,
            stagger: options.stagger ?? 0.1,
            delay: options.delay ?? 0,
            ...revealDefaults,
            scrollTrigger: {
                trigger: options.trigger ?? section,
                start: options.start ?? "top 82%",
                once: true,
            },
        }
    );
};

export const animateBannerSection = (section: HTMLElement) => {
    if (prefersReducedMotion()) return;

    registerScrollTrigger();

    const image = section.querySelector(".banner-section-image");
    const overlay = section.querySelector(".banner-section-overlay");
    const contentItems = section.querySelectorAll(
        ".banner-section-eyebrow, .banner-section-content h1, .banner-section-content p, .banner-section-actions"
    );

    const tl = gsap.timeline({
        defaults: {
            ease: "power3.out",
        },
        scrollTrigger: {
            trigger: section,
            start: "top 86%",
            once: true,
        },
    });

    if (image) {
        tl.fromTo(
            image,
            {
                scale: 1.04,
                opacity: 0,
            },
            {
                scale: 1,
                opacity: 1,
                duration: 1.15,
            }
        );
    }

    if (overlay) {
        tl.fromTo(
            overlay,
            {
                opacity: 0,
            },
            {
                opacity: 1,
                duration: 0.6,
            },
            "-=0.75"
        );
    }

    if (contentItems.length) {
        tl.fromTo(
            contentItems,
            {
                y: 26,
                opacity: 0,
            },
            {
                y: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 0.78,
            },
            "-=0.42"
        );
    }
};

export const animateCardGrid = (
    container: HTMLElement,
    cardSelector: string,
    options: {
        start?: string;
        stagger?: number;
        y?: number;
    } = {}
) => {
    animateSectionReveal(container, cardSelector, {
        start: options.start ?? "top 84%",
        stagger: options.stagger ?? 0.09,
        y: options.y ?? 24,
    });
};

export const animateFooter = (footer: HTMLElement) => {
    if (prefersReducedMotion()) return;

    registerScrollTrigger();

    const columns = footer.querySelectorAll(
        ".footerContentHeader, .footerContentNavigation, .footerContentPayment"
    );
    const footerInfo = footer.querySelector(".footerContentFooter");

    const tl = gsap.timeline({
        defaults: {
            ease: "power3.out",
        },
        scrollTrigger: {
            trigger: footer,
            start: "top 88%",
            once: true,
        },
    });

    if (columns.length) {
        tl.fromTo(
            columns,
            {
                y: 24,
                opacity: 0,
            },
            {
                y: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 0.75,
            }
        );
    }

    if (footerInfo) {
        tl.fromTo(
            footerInfo,
            {
                opacity: 0,
            },
            {
                opacity: 1,
                duration: 0.6,
            },
            "-=0.2"
        );
    }
};

export const animateProductDetails = (section: HTMLElement) => {
    if (prefersReducedMotion()) return;

    const gallery = section.querySelector(".product-gallery");
    const contentItems = section.querySelectorAll(
        ".breadcrumb, .product-details-info, .category-filter-section, .product-purchase-actions, .product-details-buy-button, .product-details-description-container"
    );

    const tl = gsap.timeline({
        defaults: {
            ease: "power3.out",
        },
    });

    if (gallery) {
        tl.fromTo(
            gallery,
            {
                x: -28,
                opacity: 0,
            },
            {
                x: 0,
                opacity: 1,
                duration: 0.85,
            }
        );
    }

    if (contentItems.length) {
        tl.fromTo(
            contentItems,
            {
                y: 22,
                opacity: 0,
            },
            {
                y: 0,
                opacity: 1,
                stagger: 0.09,
                duration: 0.72,
            },
            "-=0.42"
        );
    }
};
