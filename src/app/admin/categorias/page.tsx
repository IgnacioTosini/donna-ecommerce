import { getCategories } from '@/app/actions/category.action';
import { CategorySection } from '@/components/admin/categories/categorySection/CategorySection';
import type { Metadata } from "next";
import './_categoriasPage.scss';

export const metadata: Metadata = {
    title: "Categorías",
    description: "Administración de categorías de Donna.",
};

export default async function CategoriasPage() {
    const categories = await getCategories();
    return (
        <div className="categorias-page">
            <CategorySection categories={categories} />
        </div>
    );
}
