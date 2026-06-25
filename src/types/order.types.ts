export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";

export interface Order {
    id: string;

    customerName: string;
    phone: string;

    total: number;

    status: OrderStatus;

    createdAt: Date;
    updatedAt: Date;
}

export interface OrderProductSummary {
    id: string;
    name: string;
    slug: string;
}

export interface OrderVariantSummary {
    id: string;
    name?: string | null;
    colorHex: string;
    product: OrderProductSummary;
}

export interface OrderSizeStockSummary {
    id: string;
    size: string;
}

export interface OrderItemWithRelations {
    id: string;
    quantity: number;
    price: number;
    orderId: string;
    variantId: string;
    productSizeStockId?: string | null;
    variant: OrderVariantSummary;
    productSizeStock?: OrderSizeStockSummary | null;
}

export interface OrderWithItems extends Omit<Order, "createdAt" | "updatedAt"> {
    createdAt: string;
    updatedAt: string;
    items: OrderItemWithRelations[];
}
