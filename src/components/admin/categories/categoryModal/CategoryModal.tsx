'use client';

import { IoMdClose } from 'react-icons/io';
import CategoryForm from '../categoryForm/CategoryForm';
import { useCategoryModalStore } from '@/store/category.store';
import './_categoryModal.scss';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const CategoryModal = ({ isOpen, onClose }: Props) => {
    const editingCategory = useCategoryModalStore((state) => state.editingCategory);

    if (!isOpen) return null;
    return (
        <div className="category-modal-container">
            <div className="category-modal">
                <div className="category-modal-header">
                    <h2 className="category-modal-title">{editingCategory ? `Editar categoría` : `Nueva categoría`}</h2>
                    <IoMdClose className="category-modal-close" onClick={onClose} />
                </div>
                <CategoryForm />
            </div>
        </div>
    )
}
