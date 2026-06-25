'use client';

import { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

import { useImageUpload } from '@/hooks/useImageUpload';
import { CategorySchema, CreateCategoryDto } from '@/schemas';
import {
    createCategoryWithImage,
    updateCategoryWithImage,
    getCategoryById,
} from '@/app/actions/category.action';

import { useCategoryModalStore } from '@/store/category.store';
import './_categoryForm.scss';

export default function CategoryForm() {
    const router = useRouter();
    const [existingImageUrl, setExistingImageUrl] = useState<string>('');
    const [isPending, startTransition] = useTransition();
    const editingCategoryId = useCategoryModalStore((state) => state.editingCategoryId);

    const isEditing = !!editingCategoryId;
    const close = useCategoryModalStore((state) => state.close);
    const image = useImageUpload();
    const generateSlug = (value: string) =>
        value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<CreateCategoryDto>({
        resolver: zodResolver(CategorySchema),
    });

    // load edit data
    useEffect(() => {
        const load = async () => {
            if (!editingCategoryId) return;

            const category = await getCategoryById(editingCategoryId);

            if (!category) return;

            reset({
                name: category.name,
                slug: category.slug,
                description: category.description ?? '',
            });

            setExistingImageUrl(category.imageUrl ?? '');
        };

        load();
    }, [editingCategoryId, reset]);

    const onSubmit = async (data: CreateCategoryDto) => {
        let uploadedImage = [];

        try {
            uploadedImage = await image.uploadMany({
                enableOptimization: true,
                format: 'webp',
                maxWidth: 800,
                maxHeight: 800,
            });
        } catch {
            return;
        }

        startTransition(async () => {
            if (isEditing) {
                const res = await updateCategoryWithImage(
                    editingCategoryId,
                    data,
                    uploadedImage && uploadedImage.length ? uploadedImage[0] : undefined
                );

                if (!res.ok) {
                    toast.error(res.message ?? 'Error al actualizar');
                    return;
                }

                toast.success('Categoría actualizada');
            } else {
                const res = await createCategoryWithImage({
                    data,
                    image: uploadedImage && uploadedImage.length ? uploadedImage[0] : undefined,
                });

                if (!res.ok) {
                    toast.error(res.message ?? 'Error al crear');
                    return;
                }

                toast.success('Categoría creada');
            }

            reset();
            image.reset();
            close();
            router.refresh();
        });
    };

    return (
        <form className="category-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
                <label>Nombre</label>
                <input
                    type='text'
                    {...register('name')}
                    onChange={(e) => {
                        register('name').onChange(e);
                        setValue('slug', generateSlug(e.target.value));
                    }}
                />
                {errors.name && <span>{errors.name.message}</span>}
            </div>

            <div className="form-group">
                <label>Slug</label>
                <input type='text' {...register('slug')} />
                {errors.slug && <span>{errors.slug.message}</span>}
            </div>

            <div className="form-group">
                <label>Descripción</label>
                <textarea {...register('description')} />
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
                <button type="button" onClick={close} disabled={isPending || image.loading} className="cancel-button">
                    Cancelar
                </button>

                <button disabled={isPending || image.loading} className="submit-button" type="submit">
                    {isPending || image.loading
                        ? 'Guardando...'
                        : 'Guardar'}
                </button>
            </div>
        </form>
    );
}
