import { getProductsForTable } from "@/app/actions/product.action";
import { ProductSection } from "@/components/admin/products/productSection/ProductSection";
import type { Metadata } from "next";
import './_productosPage.scss';

export const metadata: Metadata = {
    title: "Productos",
    description: "Administración de productos de Donna.",
};

export default async function ProductosPage() {
    const products = await getProductsForTable();
    return (
        <div className="productos-page">
            <ProductSection products={products} />
        </div>
    );
}
