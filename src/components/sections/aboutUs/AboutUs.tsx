'use client';

import { Title } from '@/components/shared/Title/Title';
import { FaArrowRight, FaInstagram, FaMapMarkerAlt } from 'react-icons/fa';
import { CiClock2 } from 'react-icons/ci';
import { useBusiness } from '@/components/layout/BusinessProvider';
import type { HomeContent } from '@/lib/site-content-schema';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { animateSectionReveal } from '@/components/animations/gsap/sectionAnimations';
import './_aboutUs.scss';

export const AboutUs = ({ content }: { content: HomeContent['about'] }) => {
    const { business: storefront } = useBusiness();
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            animateSectionReveal(
                sectionRef.current!,
                '.title-container, .about-us-description, .about-us-visit',
                {
                    stagger: 0.1,
                    y: 28,
                }
            );
        }, sectionRef.current);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={sectionRef} className="about-us-section">
            <div className="about-us-container">
                <Title title={content.title} subTitle={content.eyebrow} />
                <div className="about-us-content">
                    <div className="about-us-description">
                        <h3 className="about-us-title">{content.heading}</h3>
                        <p className="about-us-text">{content.description}</p>
                        <p className="about-us-text">{storefront.shipping} y {storefront.installments.toLowerCase()}. {content.secondParagraph}</p>
                        <button className="about-us-button" onClick={() => window.location.href = content.buttonLink}>{content.buttonText} <FaArrowRight className='about-us-button-icon' /></button>
                    </div>
                    <div className="about-us-visit">
                        <h3 className="about-us-title">{content.visitTitle}</h3>
                        <p className="about-us-text">{content.visitText} @{storefront.instagramUsername}</p>
                        <div className="about-us-location">
                            <FaMapMarkerAlt className='about-us-location-icon' />
                            <div className="about-us-location-text">
                                <p className='about-us-location-line'>{storefront.address}</p>
                                <p className='about-us-location-line'>{storefront.locality} · {storefront.postalCode}</p>
                            </div>
                        </div>
                        <div className="about-us-hours">
                            <CiClock2 className='about-us-hours-icon' />
                            <div className="about-us-hours-text">
                                <p className='about-us-hours-line'>{storefront.openingDays}</p>
                                <p className='about-us-hours-line'>{storefront.openingHours}</p>
                            </div>
                        </div>
                        <a href={`https://www.instagram.com/${storefront.instagramUsername}/`} target='_blank' rel='noopener noreferrer' className="about-us-button">
                            <FaInstagram className='about-us-button-icon' />VER INSTAGRAM
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
