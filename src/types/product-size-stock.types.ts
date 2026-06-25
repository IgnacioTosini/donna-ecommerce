export interface ProductSizeStock {
    id: string;

    size: string;
    stock: number;
    sku?: string | null;

    variantId: string;

    createdAt: string;
    updatedAt: string;
}