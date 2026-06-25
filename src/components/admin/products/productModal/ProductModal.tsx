import { IoMdClose } from 'react-icons/io';
import { useProductModalStore } from '@/store/product.store';
import ProductForm from '../productForm/ProductForm';
import './_productModal.scss';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const ProductModal = ({ isOpen, onClose }: Props) => {
    const editingProduct = useProductModalStore((state) => state.editingProduct);

    if (!isOpen) return null;
    return (
        <div className="product-modal-container">
            <div className="product-modal">
                <div className="product-modal-header">
                    <h2 className="product-modal-title">{editingProduct ? `Editar producto` : `Nuevo producto`}</h2>
                    <IoMdClose className="product-modal-close" onClick={onClose} />
                </div>
                <ProductForm />
            </div>
        </div>
    )
}
