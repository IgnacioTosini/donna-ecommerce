import type { OrderStatus } from '@prisma/client';

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
    PENDING: ['PENDING', 'CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['CONFIRMED', 'SHIPPED', 'CANCELLED'],
    SHIPPED: ['SHIPPED', 'DELIVERED'],
    DELIVERED: ['DELIVERED'],
    CANCELLED: ['CANCELLED', 'PENDING', 'CONFIRMED'],
};

export function getAllowedOrderStatuses(status: OrderStatus): readonly OrderStatus[] {
    return transitions[status];
}

export function getStockTransition(current: OrderStatus, next: OrderStatus, deducted: boolean) {
    if (!transitions[current]?.includes(next)) throw new Error('Ese cambio de estado no está permitido. Confirmá antes de enviar y enviá antes de marcar como entregado.');
    // Legacy pending orders keep their reservation until confirmed or cancelled.
    const shouldDeduct = next === 'PENDING' && current === 'PENDING'
        ? deducted : ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(next);
    return { reserve: shouldDeduct && !deducted, restore: !shouldDeduct && deducted, stockDeducted: shouldDeduct };
}
