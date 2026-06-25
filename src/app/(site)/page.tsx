import { BannerPlacement } from "@prisma/client";
import { getBannersByPlacement } from "../actions/banner.action";
import { BannerSection } from "@/components/sections/bannerSection/BannerSection";
import { Categories } from "@/components/sections/categories/Categories";
import { getCategories } from "../actions/category.action";
import { Products } from "@/components/sections/products/Products";
import { getProducts } from "../actions/product.action";
import { InfoSection } from "@/components/sections/infoSection/InfoSection";
import { AboutUs } from "@/components/sections/aboutUs/AboutUs";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Inicio",
    description:
        "Descubrí las novedades, bestsellers y colecciones destacadas de Donna.",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "Donna | Indumentaria y moda online",
        description:
            "Descubrí las novedades, bestsellers y colecciones destacadas de Donna.",
        url: "/",
    },
};

export default async function Home() {
    const [heroBanners, promoBanners, collectionBanners, categories, products] = await Promise.all([
        getBannersByPlacement(BannerPlacement.HERO),
        getBannersByPlacement(BannerPlacement.PROMO),
        getBannersByPlacement(BannerPlacement.COLLECTION),
        getCategories(),
        getProducts(),
    ]);
    const activeProducts = products.filter((product) => product.active);
    const bestSellers = activeProducts.filter((product) => product.featured).slice(0, 4);
    const newArrivals = activeProducts.slice(0, 4);

    return (
        <main>
            <BannerSection banners={heroBanners} />
            <Categories categories={categories} />
            <Products span="Lo más vendido" title="Bestsellers de la temporada" products={bestSellers} />
            <BannerSection banners={promoBanners} />
            <Products span="Novedades" title="Recién llegados" products={newArrivals} />
            <BannerSection banners={collectionBanners} />
            <AboutUs />
            <InfoSection />
        </main>
    );
}
