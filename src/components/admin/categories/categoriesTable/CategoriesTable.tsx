import { Category } from '@/types';
import { GoPencil } from "react-icons/go";
import { FaRegTrashAlt } from 'react-icons/fa';
import { useCategoryModalStore } from '@/store/category.store';
import { deleteCategoryWithImage } from '@/app/actions/category.action';
import { toast } from 'react-toastify';
import { SearchBar } from '@/components/shared/searchBar/SearchBar';
import { useSearch } from '@/hooks/useSearch';
import { SortDirection, useSortableTable } from '@/hooks/useSortableTable';
import './_categoriesTable.scss';
import Image from 'next/image';

interface Props {
    categories: Category[];
}

type CategorySortKey = 'name' | 'slug' | 'description' | 'products';

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

export const CategoriesTable = ({ categories }: Props) => {
    const {
        query,
        setQuery,
        filteredItems: filteredCategories,
    } = useSearch<Category>(
        categories,
        (category, search) =>
            category.name.toLowerCase().includes(search) ||
            category.slug.toLowerCase().includes(search) ||
            (category.description ?? '').toLowerCase().includes(search) ||
            category.id.toLowerCase().includes(search)
    );

    const openEditCategory = useCategoryModalStore((state) => state.openEdit);
    const {
        sortedItems: sortedCategories,
        sortBy,
        getSortDirection,
    } = useSortableTable<Category, CategorySortKey>({
        items: filteredCategories,
        columns: [
            { key: 'name', accessor: (category) => category.name },
            { key: 'slug', accessor: (category) => category.slug },
            { key: 'description', accessor: (category) => category.description ?? '' },
            { key: 'products', accessor: (category) => category.products.length, defaultDirection: 'desc' },
        ],
    });

    const handleDeleteCategory = async (category: Category) => {
        const result = await deleteCategoryWithImage(category.id);

        if (result.ok) {
            toast.success('Categoría eliminada');
        } else {
            toast.error('Error al eliminar categoría');
        }
    };
    return (
        <div className="categories-table-wrapper">
            <SearchBar placeholder="Buscar categoría..." query={query} onChange={setQuery} />
            <table className="categories-table">
                <thead className="categories-table-header">
                    <tr className="categories-table-row">
                        <th className="categories-table-cell"><SortableHeader label="Nombre" direction={getSortDirection('name')} onClick={() => sortBy('name')} /></th>
                        <th className="categories-table-cell"><SortableHeader label="Slug" direction={getSortDirection('slug')} onClick={() => sortBy('slug')} /></th>
                        <th className="categories-table-cell"><SortableHeader label="Descripción" direction={getSortDirection('description')} onClick={() => sortBy('description')} /></th>
                        <th className="categories-table-cell"><SortableHeader label="Productos" direction={getSortDirection('products')} onClick={() => sortBy('products')} /></th>
                        <th className="categories-table-cell">Acciones</th>
                    </tr>
                </thead>
                <tbody className="categories-table-body">
                    {sortedCategories.map((category) => {
                        const imageUrl = category.imageUrl || '/logo.jpg';

                        return (
                            <tr key={category.id} className="categories-table-row">
                                <td className="categories-table-cell" data-label="Nombre">
                                    <div className="categories-table-name">
                                        <span className="category-image-frame">
                                            <Image
                                                src={imageUrl}
                                                alt=""
                                                fill
                                                sizes="72px"
                                                className="category-image-background"
                                                aria-hidden="true"
                                            />
                                            <Image
                                                src={imageUrl}
                                                alt={category.name}
                                                fill
                                                sizes="72px"
                                                quality={95}
                                                className="category-image"
                                            />
                                        </span>
                                        <div>
                                            <strong>{category.name}</strong>
                                            <span>ID: {category.id.slice(0, 6)}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="categories-table-cell" data-label="Slug">/{category.slug}</td>
                                <td className="categories-table-cell" data-label="Descripción">{category.description || '-'}</td>
                                <td className="categories-table-cell" data-label="Productos">
                                    <span className="categories-products-badge">{category.products.length}</span>
                                </td>
                                <td className="categories-table-cell" data-label="Acciones">
                                    <div className="categories-table-actions">
                                        <button className="categories-table-button" onClick={() => openEditCategory(category)}><GoPencil /></button>
                                        <button className="categories-table-button" onClick={() => handleDeleteCategory(category)}><FaRegTrashAlt /></button>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {sortedCategories.length === 0 && (
                <p className="categories-empty">
                    No se encontraron categorías.
                </p>
            )}
        </div>
    )
}
