import { BannerPlacement } from "@prisma/client";
import { getBannersByPlacement } from "../actions/banner.action";
import { BannerSection } from "@/components/sections/bannerSection/BannerSection";
import { Categories } from "@/components/sections/categories/Categories";
import { getCategoriesWithProductCount } from "../actions/category.action";
import { Products } from "@/components/sections/products/Products";
import { getHomeProductSections } from "../actions/product.action";
import { InfoSection } from "@/components/sections/infoSection/InfoSection";
import { AboutUs } from "@/components/sections/aboutUs/AboutUs";
import { EditorialSpotlight } from "@/components/sections/editorialSpotlight/EditorialSpotlight";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Inicio",
    description:
        "Descubrí las novedades, bestsellers y colecciones destacadas de una tienda demo.",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "Tienda Demo | Indumentaria y moda online",
        description:
            "Descubrí las novedades, bestsellers y colecciones destacadas de una tienda demo.",
        url: "/",
    },
};

export default async function Home() {
    const [heroBanners, promoBanners, collectionBanners, categories, productSections] = await Promise.all([
        getBannersByPlacement(BannerPlacement.HERO),
        getBannersByPlacement(BannerPlacement.PROMO),
        getBannersByPlacement(BannerPlacement.COLLECTION),
        getCategoriesWithProductCount(),
        getHomeProductSections(),
    ]);

    return (
        <main>
            <BannerSection banners={heroBanners} />
            <EditorialSpotlight />
            <Categories categories={categories} />
            <Products span="Lo más vendido" title="Bestsellers de la temporada" products={productSections.bestSellers} variant="editorial" />
            <BannerSection banners={promoBanners} />
            <Products span="Novedades" title="Recién llegados" products={productSections.newArrivals} />
            <BannerSection banners={collectionBanners} />
            <AboutUs />
            <InfoSection />
        </main>
    );
}
