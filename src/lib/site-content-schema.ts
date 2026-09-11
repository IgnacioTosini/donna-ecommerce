import { z } from 'zod';
import { storefront } from './storefront';

const text = z.string().trim().min(1, 'Completá este campo').max(250);
const paragraph = z.string().trim().min(1, 'Completá este campo').max(2000);
const link = z.string().trim().max(500).refine(value => {
    if (/^\/(?!\/)/.test(value) && !/[\\\s]/.test(value)) return true;
    try { return new URL(value).protocol === 'https:'; } catch { return false; }
}, 'Usá una ruta de la tienda (/categoria) o un enlace https://');
const image = link.refine(value => {
    if (value.startsWith('/')) return true;
    return new URL(value).hostname === 'res.cloudinary.com';
}, 'Subí una imagen o usá una URL de Cloudinary');
const section = z.object({ visible: z.boolean(), title: text, eyebrow: text });
export const businessSchema = z.object({
    name: text, category: text, address: text, locality: text, postalCode: text,
    openingDays: text, openingHours: text, shipping: text, installments: text,
    instagramUsername: z.string().trim().regex(/^[a-zA-Z0-9._]{1,30}$/, 'Ingresá el usuario sin @'),
    whatsapp: z.string().trim().regex(/^(?:[1-9]\d{7,14})?$/, 'Usá solo números, con código de país, o dejalo vacío'),
    footerDescription: paragraph,
    deliveryPolicy: paragraph.default('Realizamos envíos a todo el país. Consultanos el costo, las opciones y el plazo estimado para tu localidad antes de confirmar la compra.'),
    exchangePolicy: paragraph.default('Antes de comprar, consultanos las condiciones de cambio de la prenda o el calzado que elegiste. Si necesitás gestionar un cambio, escribinos con el número de pedido y el detalle de tu consulta.'),
});
export const homeSchema = z.object({
    hero: z.object({ visible: z.boolean() }),
    editorial: section.extend({ description: paragraph, note: text, image: image, imageAlt: text,
        primaryText: text, primaryLink: link, secondaryText: text, secondaryLink: link,
        badge: text, badgeText: text }),
    categories: section,
    featured: section.extend({ count: z.number().int().min(1).max(12) }),
    promo: z.object({ visible: z.boolean() }),
    arrivals: section.extend({ count: z.number().int().min(1).max(12) }),
    collection: z.object({ visible: z.boolean() }),
    about: section.extend({ heading: text, description: paragraph, secondParagraph: paragraph,
        buttonText: text, buttonLink: link, visitTitle: text, visitText: paragraph }),
    benefits: z.object({ visible: z.boolean(), shippingDetail: text, installmentsDetail: text,
        contactTitle: text, contactDetail: text }),
});
export type BusinessContent = z.infer<typeof businessSchema>;
export type HomeContent = z.infer<typeof homeSchema>;
export type ContentKey = 'home' | 'business';

export const defaultBusiness: BusinessContent = {
    name: storefront.name, category: storefront.category, address: storefront.address,
    locality: storefront.locality, postalCode: storefront.postalCode,
    openingDays: storefront.openingDays, openingHours: storefront.openingHours,
    shipping: storefront.shipping, installments: storefront.installments,
    instagramUsername: storefront.instagramUsername,
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
    footerDescription: 'Calzado y ropa en Río Segundo, Córdoba. Explorá la selección Donna y encontrá tu próximo look.',
    deliveryPolicy: 'Realizamos envíos a todo el país. Consultanos el costo, las opciones y el plazo estimado para tu localidad antes de confirmar la compra.',
    exchangePolicy: 'Antes de comprar, consultanos las condiciones de cambio de la prenda o el calzado que elegiste. Si necesitás gestionar un cambio, escribinos con el número de pedido y el detalle de tu consulta.',
};
export const defaultHome: HomeContent = {
    hero: { visible: true },
    editorial: { visible: true, eyebrow: 'Universo Donna', title: 'Tu próximo look empieza acá',
        description: 'Una selección de piezas versátiles para crear combinaciones con personalidad, desde básicos atemporales hasta acentos de temporada.',
        note: 'Piezas seleccionadas para combinar entre semana y fin de semana.',
        image: '/heroImage.jpg', imageAlt: 'Colección editorial de temporada',
        primaryText: 'Ver destacados', primaryLink: '/categoria?sort=featured',
        secondaryText: 'Explorar novedades', secondaryLink: '/categoria?sort=newest',
        badge: 'Selección Donna', badgeText: 'A tu manera' },
    categories: { visible: true, eyebrow: 'Explorá la colección', title: 'Categorías' },
    featured: { visible: true, eyebrow: 'Selección Donna', title: 'Destacados para tu próximo look', count: 4 },
    promo: { visible: true },
    arrivals: { visible: true, eyebrow: 'Novedades', title: 'Recién llegados', count: 4 },
    collection: { visible: true },
    about: { visible: true, eyebrow: 'Conocé Donna', title: 'Tu estilo, tu manera', heading: 'Encontrá tu próximo look',
        description: 'Calzado y ropa en Río Segundo, Córdoba. En Donna encontrás prendas para combinar a tu manera, desde un básico para todos los días hasta ese detalle que completa tu look.',
        secondParagraph: 'Recorré el catálogo y escribinos para consultar por talles, disponibilidad y las condiciones de las promociones.',
        buttonText: 'VER NUEVOS INGRESOS', buttonLink: '/categoria?sort=newest',
        visitTitle: 'Visitá Donna', visitText: 'Te esperamos en nuestro local. También podés conocer las novedades y escribirnos por Instagram.' },
    benefits: { visible: true, shippingDetail: 'Consultanos costos y tiempos de entrega para tu localidad',
        installmentsDetail: 'Consultá los medios de pago y las condiciones de la promoción',
        contactTitle: 'Atención al cliente', contactDetail: 'Consultá talles y disponibilidad por Instagram' },
};
