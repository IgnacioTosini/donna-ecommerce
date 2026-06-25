export interface OrderItem {
    id: string;

    quantity: number;

    price: number;

    orderId: string;
    variantId: string;
    productSizeStockId?: string | null;
}
