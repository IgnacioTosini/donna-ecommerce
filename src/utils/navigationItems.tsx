import { CiSearch } from "react-icons/ci";
import { IoBagHandleOutline } from "react-icons/io5";

type NavigationItem = {
    id: string;
    label: string;
    href: string;
    sectionId?: string;
};

export const navigationItems: readonly NavigationItem[] = [
    { id: 'women', label: 'Mujer', href: '/categoria?category=mujer', sectionId: '' },
    { id: 'men', label: 'Hombre', href: '/categoria?category=hombre', sectionId: '' },
    { id: 'new', label: 'Nuevos', href: '/categoria?sort=newest', sectionId: '' },
];

export const navigationIcons = [
    {
        id: "search",
        icon: CiSearch,
        href: "/search",
    },
    {
        id: "cart",
        icon: IoBagHandleOutline,
        href: "/cart",
    },
];