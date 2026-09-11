'use client';

import { ProductListItem } from '@/types';
import { Title } from '@/components/shared/Title/Title';
import { ProductsGrid } from '@/components/shared/productsGrid/ProductsGrid';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { animateSectionReveal } from '@/components/animations/gsap/sectionAnimations';
import './_products.scss';

interface Props {
    span: string;
    title: string;
    products: ProductListItem[];
    variant?: 'default' | 'editorial';
}

export const Products = ({ span, title, products, variant = 'default' }: Props) => {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            animateSectionReveal(sectionRef.current!, '.title-container');
        }, sectionRef.current);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={sectionRef} className={`products-section products-section--${variant}`}>
            <div className="products-wrapper">
                <Title title={span} subTitle={title} />

                <ProductsGrid products={products} />
            </div>
        </div>
    )
}
