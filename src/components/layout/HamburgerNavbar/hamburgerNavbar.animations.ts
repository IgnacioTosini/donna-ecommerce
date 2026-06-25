import gsap from "gsap";

export const animateHamburgerMenuOpen = (
    menu: HTMLDivElement
) => {
    const links = menu.querySelectorAll("a");

    const tl = gsap.timeline();

    tl.fromTo(
        menu,
        {
            opacity: 0,
            scaleY: 0.9,
        },
        {
            opacity: 1,
            scaleY: 1,
            duration: 0.3,
            ease: "power2.out",
        }
    );

    tl.fromTo(
        links,
        {
            opacity: 0,
            x: -20,
        },
        {
            opacity: 1,
            x: 0,
            stagger: 0.06,
            duration: 0.4,
            ease: "power3.out",
        },
        "-=0.15"
    );
};

export const animateHamburgerMenuClose = (
    menu: HTMLDivElement,
    onComplete: () => void
) => {
    gsap.to(menu, {
        opacity: 0,
        y: -15,
        duration: 0.25,
        ease: "power2.in",
        onComplete,
    });
};