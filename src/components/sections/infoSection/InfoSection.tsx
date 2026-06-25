'use client';

import { FaTruck } from 'react-icons/fa';
import { TfiReload } from "react-icons/tfi";
import { CiHeadphones } from 'react-icons/ci';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { animateCardGrid } from '@/components/animations/gsap/sectionAnimations';
import './_infoSection.scss';

const infoItems = [
    {
        icon: <FaTruck className='info-icon' />,
        title: 'Envío rápido',
        description: 'En pedidos superiores a $50.000',
    },
    {
        icon: <TfiReload className='info-icon' />,
        title: 'Devoluciones fáciles',
        description: '30 días para cambiar o devolver tu compra',
    },
    {
        icon: <CiHeadphones className='info-icon' />,
        title: 'Atención al cliente',
        description: 'Estamos aquí para ayudarte en todo momento',
    }
]

export const InfoSection = () => {
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
