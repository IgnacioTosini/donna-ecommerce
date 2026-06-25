'use client';

import { ProductImage } from '@/types';
import Image from 'next/image';
import { useState } from 'react';
import './_productGallery.scss';

interface Props {
    images: ProductImage[];
}

export const ProductGallery = ({ images }: Props) => {
    const [activeImageId, setActiveImageId] = useState(images[0]?.id);
    const activeImage = images.find((image) => image.id === activeImageId) ?? images[0];

    if (!activeImage) {
        return (
            <div className="product-gallery product-gallery-empty">
                <span>Sin imagen</span>
            </div>
        );
    }

    return (
        <div className="product-gallery">
            <div className="product-gallery-thumbnails" aria-label="Imagenes del producto">
                {images.map((image, index) => (
                    <button
                        key={image.id}
                        type="button"
                        className={`product-gallery-thumbnail ${image.id === activeImage.id ? 'is-active' : ''}`}
                        onClick={() => setActiveImageId(image.id)}
                        aria-label={`Ver imagen ${index + 1}`}
                        aria-pressed={image.id === activeImage.id}
                    >
                        <Image
                            src={image.url}
                            alt={`Miniatura ${index + 1}`}
                            fill
                            sizes="72px"
                            className="product-gallery-thumbnail-image"
                        />
                    </button>
                ))}
            </div>

            <div className="product-gallery-main">
                <Image
                    src={activeImage.url}
                    alt="Imagen principal del producto"
                    fill
                    sizes="(max-width: 768px) 100vw, 720px"
                    className="product-gallery-main-image"
                    priority
                />
            </div>
        </div>
    );
}
