import { BannerPlacement } from '@prisma/client';
import { getActiveBanners } from '@/app/actions/banner.action';
import { getCategoriesWithProductCount } from '@/app/actions/category.action';
import { getHomeProductSections } from '@/app/actions/product.action';
import type { HomeContent } from '@/lib/site-content-schema';
import { BannerSection } from './bannerSection/BannerSection';
import { EditorialSpotlight } from './editorialSpotlight/EditorialSpotlight';
import { Categories } from './categories/Categories';
import { Products } from './products/Products';
import { AboutUs } from './aboutUs/AboutUs';
import { InfoSection } from './infoSection/InfoSection';

export async function HomeContentView({ content }: { content: HomeContent }) {
    const [banners, categories, products] = await Promise.all([
        content.hero.visible || content.promo.visible || content.collection.visible ? getActiveBanners() : [],
        content.categories.visible ? getCategoriesWithProductCount() : [],
        content.featured.visible || content.arrivals.visible ? getHomeProductSections() : { bestSellers: [], newArrivals: [] },
    ]);
    return <>
        {content.hero.visible && <BannerSection banners={banners.filter(b => b.placement === BannerPlacement.HERO)} />}
        {content.editorial.visible && <EditorialSpotlight content={content.editorial} />}
        {content.categories.visible && <Categories categories={categories} title={content.categories.title} eyebrow={content.categories.eyebrow} />}
        {content.featured.visible && <Products span={content.featured.eyebrow} title={content.featured.title} products={products.bestSellers.slice(0, content.featured.count)} variant="editorial" />}
        {content.promo.visible && <BannerSection banners={banners.filter(b => b.placement === BannerPlacement.PROMO)} />}
        {content.arrivals.visible && <Products span={content.arrivals.eyebrow} title={content.arrivals.title} products={products.newArrivals.slice(0, content.arrivals.count)} />}
        {content.collection.visible && <BannerSection banners={banners.filter(b => b.placement === BannerPlacement.COLLECTION)} />}
        {content.about.visible && <AboutUs content={content.about} />}
        {content.benefits.visible && <InfoSection content={content.benefits} />}
    </>;
}
