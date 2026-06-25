import { ProductSizeStock } from './product-size-stock.types';

export interface ProductVariant {
    id: string;

    name?: string | null;
    colorHex: string;

    productId: string;

    sizes: ProductSizeStock[];

    createdAt: string;
    updatedAt: string;
}
