import gsap from "gsap";

export const animateNavbarEntrance = (
    navbar: HTMLElement
) => {
    const brand = navbar.querySelector(".navbarBrand");
    const links = navbar.querySelectorAll(".navbarLink");
    const icons = navbar.querySelectorAll(".navbarIcon");

    const tl = gsap.timeline({
        defaults: {
            ease: "power3.out",
        },
    });

    if (brand) {
        tl.fromTo(
            brand,
            {
                x: -30,
                opacity: 0,
            },
            {
                x: 0,
                opacity: 1,
                duration: 0.5,
            },
            "-=0.45"
        );
    }

    if (links.length) {
        tl.fromTo(
            links,
            {
                y: -15,
                opacity: 0,
            },
            {
                y: 0,
                opacity: 1,
                stagger: 0.06,
                duration: 0.45,
            },
            "-=0.3"
        );
    }

    if (icons.length) {
        tl.fromTo(
            icons,
            {
                x: 20,
                opacity: 0,
            },
            {
                x: 0,
                opacity: 1,
                stagger: 0.05,
                duration: 0.4,
            },
            "-=0.4"
        );
    }
};