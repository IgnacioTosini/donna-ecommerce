'use client';

import Image from 'next/image';
import { Banner } from '@/types';
import { GoPencil } from 'react-icons/go';
import { FaRegTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { SearchBar } from '@/components/shared/searchBar/SearchBar';
import { useSearch } from '@/hooks/useSearch';
import { SortDirection, useSortableTable } from '@/hooks/useSortableTable';
import { useBannerModalStore } from '@/store/banner.store';
import { deleteBannerWithImage } from '@/app/actions/banner.action';
import './_bannersTable.scss';
import { useRouter } from 'next/navigation';

interface Props {
    banners: Banner[];
}

type BannerSortKey = 'title' | 'button' | 'order' | 'active';

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

export const BannersTable = ({ banners }: Props) => {
    const router = useRouter();
    const openEditBanner = useBannerModalStore((state) => state.openEdit);

    const {
        query,
        setQuery,
        filteredItems: filteredBanners,
    } = useSearch<Banner>(
        banners,
        (banner, search) =>
            banner.title.toLowerCase().includes(search) ||
            banner.subtitle?.toLowerCase().includes(search) ||
            banner.buttonText?.toLowerCase().includes(search) ||
            banner.buttonLink?.toLowerCase().includes(search) ||
            banner.id.toLowerCase().includes(search)
    );

    const handleDeleteBanner = async (banner: Banner) => {
        const result = await deleteBannerWithImage(banner.id);

        if (result.ok) {
            toast.success('Banner eliminado');
            router.refresh();
        } else {
            toast.error(result.message ?? 'Error al eliminar banner');
        }
    };

    const {
        sortedItems: sortedBanners,
        sortBy,
        getSortDirection,
    } = useSortableTable<Banner, BannerSortKey>({
        items: filteredBanners,
        initialSort: {
            key: 'order',
            direction: 'asc',
        },
        columns: [
            { key: 'title', accessor: (banner) => banner.title },
            { key: 'button', accessor: (banner) => banner.buttonText ?? '' },
            { key: 'order', accessor: (banner) => banner.order },
            { key: 'active', accessor: (banner) => banner.active, defaultDirection: 'desc' },
        ],
    });

    return (
        <div className="banners-table-wrapper">
            <SearchBar
                placeholder="Buscar banner..."
                query={query}
                onChange={setQuery}
            />

            <table className="banners-table">
                <thead className="banners-table-header">
                    <tr className="banners-table-row">
                        <th className="banners-table-cell"><SortableHeader label="Banner" direction={getSortDirection('title')} onClick={() => sortBy('title')} /></th>
                        <th className="banners-table-cell"><SortableHeader label="Botón" direction={getSortDirection('button')} onClick={() => sortBy('button')} /></th>
                        <th className="banners-table-cell"><SortableHeader label="Orden" direction={getSortDirection('order')} onClick={() => sortBy('order')} /></th>
                        <th className="banners-table-cell"><SortableHeader label="Estado" direction={getSortDirection('active')} onClick={() => sortBy('active')} /></th>
                        <th className="banners-table-cell">Acciones</th>
                    </tr>
                </thead>

                <tbody className="banners-table-body">
                    {sortedBanners.map((banner) => (
                        <tr key={banner.id} className="banners-table-row">
                            <td data-label="Banner" className="banners-table-cell">
                                <div className="banner-info">
                                    <Image
                                        src={banner.imageUrl}
                                        alt={banner.title}
                                        width={72}
                                        height={42}
                                        className="banner-image"
                                    />

                                    <div>
                                        <strong>{banner.title}</strong>
                                        {banner.subtitle && (
                                            <span>{banner.subtitle}</span>
                                        )}
                                    </div>
                                </div>
                            </td>

                            <td data-label="Botón" className="banners-table-cell">
                                <div className="banner-button-info">
                                    <strong>{banner.buttonText || '-'}</strong>
                                    <span>{banner.buttonLink || '-'}</span>
                                </div>
                            </td>

                            <td data-label="Orden" className="banners-table-cell">{banner.order}</td>

                            <td data-label="Estado" className="banners-table-cell">
                                <span
                                    className={`banner-status ${banner.active ? 'active' : 'inactive'
                                        }`}
                                >
                                    {banner.active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>

                            <td data-label="Acciones" className="banners-table-cell">
                                <div className="banner-actions">
                                    <button onClick={() => openEditBanner(banner)}>
                                        <GoPencil />
                                    </button>

                                    <button onClick={() => handleDeleteBanner(banner)}>
                                        <FaRegTrashAlt />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {sortedBanners.length === 0 && (
                <p className="banners-empty">
                    No se encontraron banners.
                </p>
            )}
        </div>
    );
};
