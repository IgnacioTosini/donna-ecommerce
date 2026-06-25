'use client';

import Link from 'next/link'
import { IoMdHome } from 'react-icons/io'
import { usePathname } from 'next/navigation';
import './_breadcrumb.scss'

interface Props {
    activeCategory?: {
        name: string;
        slug?: string;
        description?: string | null;
    };
    productName?: string;
}

export const Breadcrumb = ({ activeCategory, productName }: Props) => {
    const pathname = usePathname();
    const isCategoryPage = pathname === '/categoria';
    const categoryLabel = activeCategory?.name ?? 'Productos';
    const categorySlug = activeCategory?.slug ?? categoryLabel.toLowerCase();

    return (
        <div className="breadcrumb">
            <IoMdHome />
            <Link href="/" className='breadcrumb-item'>Inicio</Link>
            {isCategoryPage ? (
                <span className='breadcrumb-item'>{categoryLabel}</span>
            ) : (
                <Link href={`/categoria?category=${encodeURIComponent(categorySlug)}`} className='breadcrumb-item'>
                    {categoryLabel}
                </Link>
            )}
            {productName && <span className='breadcrumb-item'>{productName}</span>}
        </div>
    )
}
