import { Category } from '@/types';
import { Title } from '@/components/shared/Title/Title';
import Link from 'next/link';
import Image from 'next/image';
import './_categories.scss';

interface Props {
    categories: Category[];
}

export const Categories = ({ categories }: Props) => {
    return (
        <div className="categories-section">
            <div className="categories-wrapper">
                <Title title='Categorías' subTitle='Explora la colección' />
                <div className="categories-list">
                    {
                        categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/categoria?category=${category.slug}`}
                                className="category-card"
                            >
                                <Image
                                    src={category.imageUrl || '/default-category.png'}
                                    alt={category.name}
                                    fill
                                    className="category-image"
                                />

                                <div className="category-overlay" />

                                <div className="category-content">
                                    <p className="category-products">
                                        {category.products.length} {category.products.length === 1 ? 'prenda' : 'prendas'}
                                    </p>

                                    <h3 className="category-name">{category.name}</h3>

                                    <span className={`category-link`}>
                                        Descubrir <span>→</span>
                                    </span>
                                </div>
                            </Link>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}
