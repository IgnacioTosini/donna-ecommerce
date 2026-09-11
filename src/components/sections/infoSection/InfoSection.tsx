'use client';

import { FaTruck, FaCreditCard } from 'react-icons/fa';
import { useBusiness } from '@/components/layout/BusinessProvider';
import type { HomeContent } from '@/lib/site-content-schema';
import { CiHeadphones } from 'react-icons/ci';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { animateCardGrid } from '@/components/animations/gsap/sectionAnimations';
import './_infoSection.scss';

export const InfoSection = ({ content }: { content: HomeContent['benefits'] }) => {
    const { business: storefront } = useBusiness();
    const infoItems = [
        {
            icon: <FaTruck className='info-icon' />,
            title: storefront.shipping,
            description: content.shippingDetail,
        },
        {
            icon: <FaCreditCard className='info-icon' />,
            title: storefront.installments,
            description: content.installmentsDetail,
        },
        {
            icon: <CiHeadphones className='info-icon' />,
            title: content.contactTitle,
            description: content.contactDetail,
        }
    ]

    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            animateCardGrid(sectionRef.current!, '.info-item', {
                stagger: 0.1,
                y: 22,
            });
        }, sectionRef.current);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={sectionRef} className="info-section">
            <div className="info-wrapper">
                {
                    infoItems.map((item, index) => (
                        <div key={index} className="info-item">
                            {item.icon}
                            <h3 className="info-title">{item.title}</h3>
                            <p className="info-description">{item.description}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
