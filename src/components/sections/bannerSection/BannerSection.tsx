import Image from 'next/image';
import Link from 'next/link';
import { Banner } from '@/types';
import './_bannerSection.scss';

interface Props {
    banners: Banner[];
}

export const BannerSection = ({ banners }: Props) => {
    const banner = banners[0];

    if (!banner) return null;

    return (
        <section className="banner-section">
            <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                priority={true}
                className="banner-section-image"
            />

            <div className="banner-section-overlay" />

            <div className="banner-section-content">
                <span className="banner-section-eyebrow">
                    {banner.span}
                </span>

                <h1>{banner.title}</h1>

                {banner.subtitle && (
                    <p>{banner.subtitle}</p>
                )}

                {banner.buttonText && banner.buttonLink && (
                    <div className="banner-section-actions">
                        <Link href={banner.buttonLink}>
                            {banner.buttonText}
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};