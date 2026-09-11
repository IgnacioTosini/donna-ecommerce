import type { OrderStatus } from '@/types';

export function matchesOrderFilters(order: { status: OrderStatus; createdAt: string }, status: string, from: string, to: string) {
    // Use the store's timezone, independent of the administrator's browser timezone.
    const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(order.createdAt));
    return (!status || order.status === status) && (!from || date >= from) && (!to || date <= to);
}

export function customerWhatsappUrl(phone: string, orderId: string) {
    const digits = phone.replace(/\D/g, '');
    // Do not guess the country code of a customer's national number.
    if (!/^\+/.test(phone.trim()) && !/^549\d{10}$/.test(digits)) return null;
    if (!/^[1-9]\d{7,14}$/.test(digits)) return null;
    return `https://wa.me/${digits}?text=${encodeURIComponent(`Hola, te escribimos por tu pedido #${orderId.slice(0, 8)}.`)}`;
}
