'use client';

import { Category } from '@/types';
import { CategoriesTable } from '../categoriesTable/CategoriesTable'
import { CategoryModal } from '../categoryModal/CategoryModal'
import { useCategoryModalStore } from '@/store/category.store';
import './_categorySection.scss'

interface Props {
    categories: Category[];
}

export const CategorySection = ({ categories }: Props) => {
    const isOpenCategory = useCategoryModalStore((state) => state.isOpen);
    const closeCategory = useCategoryModalStore((state) => state.close);
    const openCreateCategory = useCategoryModalStore((state) => state.openCreate);
    
    return (
        <>
            <div className="categorias-header">
                <div className="categorias-header-text">
                    <h1 className="categorias-title">Categorías</h1>
                    <p className="categorias-description">{categories.length} {categories.length === 1 ? 'categoría disponible' : 'categorías disponibles'}</p>
                </div>
                <button className="categorias-button" onClick={openCreateCategory}>+ Nueva Categoría</button>
            </div>
            <CategoryModal isOpen={isOpenCategory} onClose={closeCategory} />
            <CategoriesTable categories={categories} />
        </>
    )
}
