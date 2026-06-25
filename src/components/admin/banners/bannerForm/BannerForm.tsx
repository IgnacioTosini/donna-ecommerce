'use client';

import { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

import { useImageUpload } from '@/hooks/useImageUpload';
import { BannerSchema, CreateBannerDto } from '@/schemas';
import {
    createBannerWithImage,
    updateBannerWithImage,
    getBannerById,
} from '@/app/actions/banner.action';
import { useBannerModalStore } from '@/store/banner.store';
import { BannerPlacement } from '@prisma/client';

import './_bannerForm.scss';

export default function BannerForm() {
    const router = useRouter();

    const [existingImageUrl, setExistingImageUrl] = useState('');
    const [isPending, startTransition] = useTransition();

    const editingBannerId = useBannerModalStore(
        (state) => state.editingBannerId
    );

    const close = useBannerModalStore((state) => state.close);

    const isEditing = !!editingBannerId;

    const image = useImageUpload();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateBannerDto>({
        resolver: zodResolver(BannerSchema),
        defaultValues: {
            active: true,
            order: 0,
            placement: BannerPlacement.HERO,
        },
    });

    useEffect(() => {
        const loadBanner = async () => {
            if (!editingBannerId) return;

            const banner = await getBannerById(editingBannerId);

            if (!banner) return;

            reset({
                span: banner.span,
                title: banner.title,
                subtitle: banner.subtitle ?? '',
                buttonText: banner.buttonText ?? '',
                buttonLink: banner.buttonLink ?? '',
                active: banner.active,
                order: banner.order,
                placement: banner.placement as BannerPlacement || BannerPlacement.HERO,
            });

            setExistingImageUrl(banner.imageUrl);
        };

        loadBanner();
    }, [editingBannerId, reset]);

    const onSubmit = async (data: CreateBannerDto) => {
        let uploadedImages = [];

        try {
            uploadedImages = await image.uploadMany({
                enableOptimization: true,
                format: 'webp',
                maxWidth: 1600,
                maxHeight: 700,
            });
        } catch {
            return;
        }

        const uploadedImage = uploadedImages[0];

        if (!isEditing && !uploadedImage) {
            toast.error('Debes subir una imagen para el banner');
            return;
        }

        startTransition(async () => {
            if (isEditing) {
                const res = await updateBannerWithImage(
                    editingBannerId,
                    data,
                    uploadedImage
                );

                if (!res.ok) {
                    toast.error(res.message ?? 'Error al actualizar el banner');
                    return;
                }

                toast.success('Banner actualizado');
            } else {
                const res = await createBannerWithImage({
                    data,
                    image: uploadedImage,
                });

                if (!res.ok) {
                    toast.error(res.message ?? 'Error al crear el banner');
                    return;
                }

                toast.success('Banner creado');
            }

            reset();
            image.reset();
            setExistingImageUrl('');
            close();
            router.refresh();
        });
    };

    return (
        <form className="banner-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
                <label>Span</label>
                <input type="text" {...register('span')} />
                {errors.span && <span>{errors.span.message}</span>}
            </div>
            <div className="form-group">
                <label>Título</label>
                <input type="text" {...register('title')} />
                {errors.title && <span>{errors.title.message}</span>}
            </div>

            <div className="form-group">
                <label>Subtítulo</label>
                <textarea {...register('subtitle')} />
                {errors.subtitle && <span>{errors.subtitle.message}</span>}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Texto del botón</label>
                    <input
                        type="text"
                        placeholder="Comprar ahora"
                        {...register('buttonText')}
                    />
                    {errors.buttonText && <span>{errors.buttonText.message}</span>}
                </div>

                <div className="form-group">
                    <label>Link del botón</label>
                    <input
                        type="text"
                        placeholder="/productos"
                        {...register('buttonLink')}
                    />
                    {errors.buttonLink && <span>{errors.buttonLink.message}</span>}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Orden</label>
                    <input
                        type="number"
                        min={0}
                        {...register('order', { valueAsNumber: true })}
                    />
                    {errors.order && <span>{errors.order.message}</span>}
                </div>

                <div className="form-group checkbox-group">
                    <label>Activo</label>
                    <input type="checkbox" {...register('active')} />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="placement">Ubicación</label>
                <select id="placement" {...register('placement')} className="placement-select">
                    <option value={BannerPlacement.HERO} className="option-hero">Hero</option>
                    <option value={BannerPlacement.PROMO} className="option-promo">Promo</option>
                    <option value={BannerPlacement.COLLECTION} className="option-collection">Colección</option>
                </select>
            </div>

            <div className="form-group">
                <label>Imagen</label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={image.onChange}
                />

                <div className="images-preview-list">
                    {image.previews.length > 0 ? (
                        image.previews.map((preview, index) => (
                            <div key={preview} className="image-preview-item">
                                <button
                                    type="button"
                                    className="remove-image-button"
                                    onClick={() => image.remove(index)}
                                >
                                    ×
                                </button>

                                <Image
                                    src={preview}
                                    alt="preview"
                                    width={320}
                                    height={140}
                                    className="image-preview"
                                />
                            </div>
                        ))
                    ) : existingImageUrl ? (
                        <Image
                            src={existingImageUrl}
                            alt="existing"
                            width={320}
                            height={140}
                            className="image-preview"
                        />
                    ) : null}
                </div>
            </div>

            <div className="button-group">
                <button
                    type="button"
                    onClick={close}
                    disabled={isPending || image.loading}
                    className="cancel-button"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={isPending || image.loading}
                    className="submit-button"
                >
                    {isPending || image.loading ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </form>
    );
}
