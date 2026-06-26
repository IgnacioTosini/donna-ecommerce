'use client';

import { Category } from '@/types';
import { Title } from '@/components/shared/Title/Title';
import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { animateCardGrid, animateSectionReveal } from '@/components/animations/gsap/sectionAnimations';
import './_categories.scss';

interface Props {
    categories: Category[];
}

export const Categories = ({ categories }: Props) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const [showScrollShadow, setShowScrollShadow] = useState(false);

    const updateScrollShadow = useCallback(() => {
        const list = listRef.current;

        if (!list) return;

        const hasScrollableContent = list.scrollHeight > list.clientHeight + 1;
        const isAtBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 1;

        setShowScrollShadow(hasScrollableContent && !isAtBottom);
    }, []);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            animateSectionReveal(sectionRef.current!, '.title-container');
            animateCardGrid(sectionRef.current!, '.category-card', {
                stagger: 0.09,
                y: 30,
            });
        }, sectionRef.current);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        updateScrollShadow();
        window.addEventListener('resize', updateScrollShadow);

        return () => window.removeEventListener('resize', updateScrollShadow);
    }, [categories.length, updateScrollShadow]);

    return (
        <div ref={sectionRef} className="categories-section">
            <div className="categories-wrapper">
                <Title title='Categorías' subTitle='Explora la colección' />
                <div className={`categories-list-scroll ${showScrollShadow ? 'has-scroll-shadow' : ''}`}>
                    <div ref={listRef} className="categories-list" onScroll={updateScrollShadow}>
                        {
                            categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/categoria?category=${category.slug}`}
                                    className="category-card"
                                >
                                    <Image
                                        src={category.imageUrl || '/default-category.png'}
                                        alt={category.name}
                                        fill
                                        className="category-image"
                                    />

                                    <div className="category-overlay" />

                                    <div className="category-content">
                                        <p className="category-products">
                                            {category.products.length} {category.products.length === 1 ? 'prenda' : 'prendas'}
                                        </p>

                                        <h3 className="category-name">{category.name}</h3>

                                        <span className={`category-link`}>
                                            Descubrir <span>→</span>
                                        </span>
                                    </div>
                                </Link>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
