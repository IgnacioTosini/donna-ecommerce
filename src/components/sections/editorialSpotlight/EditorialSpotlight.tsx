"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { animateEditorialSpotlight } from '@/components/animations/gsap/sectionAnimations';
import './_editorialSpotlight.scss';

export const EditorialSpotlight = () => {
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
                    <p className="editorial-spotlight-kicker">Editorial</p>
                    <h2>Looks curados para elevar tu estilo diario</h2>
                    <p>
                        Una selección de piezas versátiles para crear combinaciones con personalidad,
                        desde básicos atemporales hasta acentos de temporada.
                    </p>
                    <p className="editorial-spotlight-note">Piezas seleccionadas para combinar entre semana y fin de semana.</p>
                    <div className="editorial-spotlight-actions">
                        <Link href="/categoria?sort=featured">Ver destacados</Link>
                        <Link href="/categoria?sort=newest" className="is-secondary">Explorar novedades</Link>
                    </div>
                </article>

                <article className="editorial-spotlight-media">
                    <Image
                        src="/heroImage.jpg"
                        alt="Coleccion editorial de temporada"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="editorial-spotlight-image"
                    />
                    <div className="editorial-spotlight-badge">
                        <span>Drop Curado</span>
                        <strong>12 piezas clave</strong>
                    </div>
                </article>
            </div>
        </section>
    );
};