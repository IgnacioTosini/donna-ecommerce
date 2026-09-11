"use client";

import type { HomeContent } from '@/lib/site-content-schema';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { animateEditorialSpotlight } from '@/components/animations/gsap/sectionAnimations';
import './_editorialSpotlight.scss';

export const EditorialSpotlight = ({ content }: { content: HomeContent['editorial'] }) => {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            animateEditorialSpotlight(sectionRef.current!);
        }, sectionRef.current);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="editorial-spotlight" aria-label="Editorial de temporada">
            <div className="editorial-spotlight-grid">
                <article className="editorial-spotlight-copy">
                    <p className="editorial-spotlight-kicker">{content.eyebrow}</p>
                    <h2>{content.title}</h2>
                    <p>{content.description}</p>
                    <p className="editorial-spotlight-note">{content.note}</p>
                    <div className="editorial-spotlight-actions">
                        <Link href={content.primaryLink}>{content.primaryText}</Link>
                        <Link href={content.secondaryLink} className="is-secondary">{content.secondaryText}</Link>
                    </div>
                </article>

                <article className="editorial-spotlight-media">
                    <Image
                        src={content.image}
                        alt={content.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="editorial-spotlight-image"
                    />
                    <div className="editorial-spotlight-badge">
                        <span>{content.badge}</span>
                        <strong>{content.badgeText}</strong>
                    </div>
                </article>
            </div>
        </section>
    );
};
