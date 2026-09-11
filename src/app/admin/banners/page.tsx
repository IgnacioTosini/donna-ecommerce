import { getBanners } from "@/app/actions/banner.action";
import { BannerSection } from "@/components/admin/banners/bannerSection/BannerSection";
import type { Metadata } from "next";
import './_bannersPage.scss';

export const metadata: Metadata = {
    title: "Banners",
    description: "Administración de banners de Donna.",
};

export default async function BannersPage() {
    const banners = await getBanners();
    return (
        <div className="banners-page">
            <BannerSection banners={banners} />
        </div>
    );
}
