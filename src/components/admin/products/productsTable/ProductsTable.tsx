'use client';

import { ProductWithRelations } from '@/types';
import { GoPencil } from 'react-icons/go';
import { FaRegTrashAlt } from 'react-icons/fa';
import { useProductModalStore } from '@/store/product.store';
import { deleteProductWithImages } from '@/app/actions/product.action';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { SearchBar } from '@/components/shared/searchBar/SearchBar';
import { useSearch } from '@/hooks/useSearch';
import { SortDirection, useSortableTable } from '@/hooks/useSortableTable';
import './_productsTable.scss';
import { useRouter } from 'next/navigation';

interface Props {
    products: ProductWithRelations[];
}

type ProductSortKey = 'name' | 'category' | 'price' | 'stock';

const SortableHeader = ({
    label,
    direction,
    onClick,
}: {
    label: string;
    direction: SortDirection | null;
    onClick: () => void;
}) => (
    <button type="button" className="table-sort-button" onClick={onClick}>
        <span>{label}</span>
        <span className="table-sort-arrow">{direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕'}</span>
    </button>
);

export const ProductsTable = ({ products }: Props) => {
    const router = useRouter();
    const openEditProduct = useProductModalStore((state) => state.openEdit);
    const {
        query,
        setQuery,
        filteredItems: filteredProducts,
    } = useSearch<ProductWithRelations>(
        products,
        (product, search) =>
            product.name.toLowerCase().includes(search) ||
            product.slug.toLowerCase().includes(search) ||
            product.category.name.toLowerCase().includes(search) ||
            product.id.toLowerCase().includes(search)
    );

    const handleDeleteProduct = async (product: ProductWithRelations) => {
        const result = await deleteProductWithImages(product.id);

        if (result.ok) {
            toast.success('Producto eliminado');
            router.refresh();
        } else {
            toast.error('Error al eliminar producto');
        }
    };

    const getTotalStock = (product: ProductWithRelations) => {
        return product.variants.reduce((acc, variant) => {
            const variantStock = variant.sizes.reduce(
                (sum, size) => sum + size.stock,
                0
            );

            return acc + variantStock;
        }, 0);
    };

    const {
        sortedItems: sortedProducts,
        sortBy,
        getSortDirection,
    } = useSortableTable<ProductWithRelations, ProductSortKey>({
        items: filteredProducts,
        columns: [
            { key: 'name', accessor: (product) => product.name },
            { key: 'category', accessor: (product) => product.category.name },
            { key: 'price', accessor: (product) => product.price, defaultDirection: 'desc' },
            { key: 'stock', accessor: getTotalStock, defaultDirection: 'desc' },
        ],
    });

    return (
        <div className="products-table-wrapper">
            <SearchBar
                query={query}
                onChange={setQuery}
                placeholder="Buscar producto..."
            />
            <table className="products-table">
                <thead>
                    <tr>
                        <th><SortableHeader label="Producto" direction={getSortDirection('name')} onClick={() => sortBy('name')} /></th>
                        <th><SortableHeader label="Categoría" direction={getSortDirection('category')} onClick={() => sortBy('category')} /></th>
                        <th><SortableHeader label="Precio" direction={getSortDirection('price')} onClick={() => sortBy('price')} /></th>
                        <th><SortableHeader label="Stock" direction={getSortDirection('stock')} onClick={() => sortBy('stock')} /></th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {sortedProducts.map((product) => {
                        const imageUrl =
                            product.images[0]?.url ?? '/placeholder-product.jpg';

                        return (
                            <tr key={product.id}>
                                <td data-label="Producto">
                                    <div className="product-info">
                                        <Image
                                            src={imageUrl}
                                            alt={product.name}
                                            width={48}
                                            height={48}
                                            className="product-image"
                                        />

                                        <div>
                                            <strong>{product.name}</strong>
                                            <span>ID: {product.id.slice(0, 6)}</span>
                                        </div>
                                    </div>
                                </td>

                                <td data-label="Categoría">
                                    {product.category.name}
                                </td>

                                <td data-label="Precio">
                                    <div className="product-price">
                                        <strong>
                                            ${product.price.toLocaleString('es-AR')}
                                        </strong>

                                        {product.compareAtPrice && (
                                            <span>
                                                ${product.compareAtPrice.toLocaleString('es-AR')}
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td data-label="Stock">
                                    <span className="stock-badge">
                                        {getTotalStock(product)}
                                    </span>
                                </td>

                                <td data-label="Acciones">
                                    <div className="product-actions">
                                        <button onClick={() => openEditProduct(product)}>
                                            <GoPencil />
                                        </button>

                                        <button onClick={() => handleDeleteProduct(product)}>
                                            <FaRegTrashAlt />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {sortedProducts.length === 0 && (
                <p className="products-empty">
                    No se encontraron productos.
                </p>
            )}
        </div>
    );
};
