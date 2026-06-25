'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Banner } from '@/types';
import { animateBannerSection } from '@/components/animations/gsap/sectionAnimations';
import './_bannerSection.scss';

interface Props {
    banners: Banner[];
}

export const BannerSection = ({ banners }: Props) => {
    const sectionRef = useRef<HTMLElement>(null);
    const banner = banners[0];

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            animateBannerSection(sectionRef.current!);
        }, sectionRef.current);

        return () => ctx.revert();
    }, []);

    if (!banner) return null;

    return (
        <section ref={sectionRef} className="banner-section">
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
