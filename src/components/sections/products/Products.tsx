import { ProductWithRelations } from '@/types';
import { Title } from '@/components/shared/Title/Title';
import { ProductsGrid } from '@/components/shared/productsGrid/ProductsGrid';
import './_products.scss';

interface Props {
    span: string;
    title: string;
    products: ProductWithRelations[];
}

export const Products = ({ span, title, products }: Props) => {
    return (
        <div className="products-section">
            <div className="products-wrapper">
                <Title title={span} subTitle={title} />

                <ProductsGrid products={products} />
            </div>
        </div>
    )
}
