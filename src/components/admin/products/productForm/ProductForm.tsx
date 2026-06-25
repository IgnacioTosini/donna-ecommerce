'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useImageUpload } from '@/hooks/useImageUpload';
import { ProductFormSchema, CreateProductDto, CreateProductForm, ProductVariantSchema } from '@/schemas';
import { createProductWithImages, updateProductWithImages, getProductById, ExistingImage } from '@/app/actions/product.action';
import { getCategories } from '@/app/actions/category.action';
import { Category } from '@/types';
import { useProductModalStore } from '@/store/product.store';
import { PRODUCT_SIZE_ORDER } from '@/utils/sizeHelpers';
import z from 'zod';

import './_productForm.scss';

const CLOTHING_SIZES = [...PRODUCT_SIZE_ORDER];

type ProductVariantForm = {
    id?: string;
    name: string;
    colorHex: string;
    sizes: {
        id?: string;
        size: string;
        stock: number;
        sku: string;
    }[];
};

const COLOR_NAMES = [
    { name: 'Negro', hex: '#000000' },
    { name: 'Blanco', hex: '#ffffff' },
    { name: 'Gris', hex: '#808080' },
    { name: 'Rojo', hex: '#dc2626' },
    { name: 'Bordo', hex: '#7f1d1d' },
    { name: 'Rosa', hex: '#ec4899' },
    { name: 'Naranja', hex: '#f97316' },
    { name: 'Amarillo', hex: '#facc15' },
    { name: 'Verde', hex: '#16a34a' },
    { name: 'Azul', hex: '#2563eb' },
    { name: 'Celeste', hex: '#38bdf8' },
    { name: 'Violeta', hex: '#7c3aed' },
    { name: 'Marrón', hex: '#7c2d12' },
    { name: 'Beige', hex: '#d6c4a1' },
];

const hexToRgb = (hex: string) => {
    const normalized = hex.replace('#', '');
    const value = normalized.length === 3
        ? normalized.split('').map((char) => char + char).join('')
        : normalized;

    return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16),
    };
};

const getColorNameFromHex = (hex: string) => {
    const selected = hexToRgb(hex);

    return COLOR_NAMES
        .map((color) => {
            const rgb = hexToRgb(color.hex);
            const distance =
                (selected.r - rgb.r) ** 2 +
                (selected.g - rgb.g) ** 2 +
                (selected.b - rgb.b) ** 2;

            return {
                name: color.name,
                distance,
            };
        })
        .sort((a, b) => a.distance - b.distance)[0].name;
};

const toSkuPart = (value: string) =>
    value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .toUpperCase();

const buildSku = (productSlug: string, colorName: string, size: string) =>
    [productSlug, colorName, size]
        .map(toSkuPart)
        .filter(Boolean)
        .join('-');

export default function ProductForm() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
    const [variants, setVariants] = useState<ProductVariantForm[]>([
        {
            name: getColorNameFromHex('#000000'),
            colorHex: '#000000',
            sizes: [
                {
                    size: 'M',
                    stock: 0,
                    sku: '',
                },
            ],
        },
    ]);
    const [variantError, setVariantError] = useState<string>('');
    const [isPending, startTransition] = useTransition();
    const lastSkuBaseRef = useRef('');
    const editingProductId = useProductModalStore(state => state.editingProductId);
    const isEditing = !!editingProductId;
    const close = useProductModalStore(state => state.close);
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
        formState: { errors },
        setValue,
        control,
    } = useForm<CreateProductForm>({
        resolver: zodResolver(ProductFormSchema),

        defaultValues: {
            active: true,
            featured: false,
            compareAtPrice: 0,
        },
    });
    const productSlug = useWatch({
        control,
        name: 'slug',
    }) ?? '';

    useEffect(() => {
        const previousSkuBase = lastSkuBaseRef.current;

        if (!productSlug || previousSkuBase === productSlug) return;

        setVariants((currentVariants) =>
            currentVariants.map((variant) => ({
                ...variant,
                sizes: variant.sizes.map((size) => {
                    const previousSku = buildSku(previousSkuBase, variant.name, size.size);
                    const nextSku = buildSku(productSlug, variant.name, size.size);

                    return {
                        ...size,
                        sku: !size.sku || size.sku === previousSku ? nextSku : size.sku,
                    };
                }),
            }))
        );

        lastSkuBaseRef.current = productSlug;
    }, [productSlug]);

    useEffect(() => {
        const loadCategories = async () => {
            const data = await getCategories();
            setCategories(data);
        };

        loadCategories();
    }, []);

    useEffect(() => {
        const loadProduct = async () => {
            if (!editingProductId) {
                setExistingImages([]);
                setVariants([
                    {
                        name: getColorNameFromHex('#000000'),
                        colorHex: '#000000',
                        sizes: [
                            {
                                size: 'M',
                                stock: 0,
                                sku: '',
                            },
                        ],
                    },
                ]);
                lastSkuBaseRef.current = '';
                return;
            }

            const product = await getProductById(editingProductId);

            if (!product) return;

            reset({
                name: product.name,
                slug: product.slug,
                description: product.description ?? '',
                price: Number(product.price),
                compareAtPrice: product.compareAtPrice !== null && product.compareAtPrice !== undefined
                    ? Number(product.compareAtPrice)
                    : 0,
                categoryId: product.categoryId,
                gender: product.gender ?? undefined,
                featured: product.featured,
                active: product.active,
            });
            lastSkuBaseRef.current = product.slug;

            // Imágenes
            if (product.images?.length > 0) {
                setExistingImages(
                    product.images.map((image) => ({
                        id: image.id,
                        url: image.url,
                        publicId: image.publicId,
                        order: image.order,
                    }))
                );
            } else {
                setExistingImages([]);
            }

            if (product.variants?.length > 0) {
                setVariants(
                    product.variants.map((variant) => ({
                        id: variant.id,
                        name: variant.name || getColorNameFromHex(variant.colorHex),
                        colorHex: variant.colorHex,
                        sizes: variant.sizes.map((size) => ({
                            id: size.id,
                            size: size.size,
                            stock: size.stock,
                            sku: size.sku ?? '',
                        })),
                    }))
                );
            }
        };

        loadProduct();
    }, [editingProductId, reset]);

    const onSubmit = async (data: CreateProductForm) => {
        const variantsToSend = variants.map((v) => ({
            id: v.id,
            name: v.name || null,
            colorHex: v.colorHex || null,
            sizes: v.sizes.map((s) => ({
                id: s.id,
                size: s.size,
                stock: Number(s.stock),
                sku: s.sku || null,
            })),
        }));

        const variantsResult = z
            .array(ProductVariantSchema)
            .min(1, "Debe tener al menos una variante")
            .safeParse(variantsToSend);

        if (!variantsResult.success) {
            setVariantError(
                variantsResult.error.issues[0]?.message ??
                'Error en las variantes'
            );
            return;
        }

        setVariantError('');

        let newImages = [];

        try {
            newImages = await image.uploadMany({
                enableOptimization: true,
                format: 'webp',
                maxWidth: 1200,
                maxHeight: 1200,
            });
        } catch {
            return;
        }

        const productData: CreateProductDto = {
            ...data,
            variants: variantsResult.data,
            images: isEditing
                ? [...existingImages, ...newImages]
                : newImages,
        };

        startTransition(async () => {
            if (isEditing) {
                const res = await updateProductWithImages(
                    editingProductId,
                    productData,
                    existingImages,
                    newImages
                );

                if (!res.ok) {
                    toast.error('Error al actualizar');
                    return;
                }

                toast.success('Producto actualizado');
            } else {
                const res = await createProductWithImages({
                    data: productData,
                    images: newImages,
                });

                if (!res.ok) {
                    toast.error('Error al crear');
                    return;
                }

                toast.success('Producto creado');
            }

            reset();
            image.reset();
            close();
            router.refresh();
        });
    };

    const updateVariantColor = (variantIndex: number, colorHex: string) => {
        setVariants((currentVariants) =>
            currentVariants.map((variant, index) => {
                if (index !== variantIndex) return variant;

                const previousAutoName = getColorNameFromHex(variant.colorHex);
                const nextAutoName = getColorNameFromHex(colorHex);
                const shouldUpdateName =
                    !variant.name || variant.name === previousAutoName;
                const nextName = shouldUpdateName ? nextAutoName : variant.name;

                return {
                    ...variant,
                    name: nextName,
                    colorHex,
                    sizes: variant.sizes.map((size) => {
                        const previousSku = buildSku(productSlug, variant.name, size.size);
                        const nextSku = buildSku(productSlug, nextName, size.size);

                        return {
                            ...size,
                            sku: !size.sku || size.sku === previousSku ? nextSku : size.sku,
                        };
                    }),
                };
            })
        );
    };

    const updateVariantName = (variantIndex: number, name: string) => {
        setVariants((currentVariants) =>
            currentVariants.map((variant, index) => {
                if (index !== variantIndex) return variant;

                return {
                    ...variant,
                    name,
                    sizes: variant.sizes.map((size) => {
                        const previousSku = buildSku(productSlug, variant.name, size.size);
                        const nextSku = buildSku(productSlug, name, size.size);

                        return {
                            ...size,
                            sku: !size.sku || size.sku === previousSku ? nextSku : size.sku,
                        };
                    }),
                };
            })
        );
    };

    const updateVariantSize = (
        variantIndex: number,
        sizeIndex: number,
        nextSize: string
    ) => {
        setVariants((currentVariants) =>
            currentVariants.map((variant, index) => {
                if (index !== variantIndex) return variant;

                return {
                    ...variant,
                    sizes: variant.sizes.map((size, currentSizeIndex) => {
                        if (currentSizeIndex !== sizeIndex) return size;

                        const previousSku = buildSku(productSlug, variant.name, size.size);
                        const nextSku = buildSku(productSlug, variant.name, nextSize);

                        return {
                            ...size,
                            size: nextSize,
                            sku: !size.sku || size.sku === previousSku ? nextSku : size.sku,
                        };
                    }),
                };
            })
        );
    };

    return (
        <form
            className="product-form"
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="form-group">
                <label>Nombre</label>

                <input
                    type="text"
                    {...register('name')}
                    onChange={(e) => {
                        const value = e.target.value;
                        setValue('name', value, {
                            shouldDirty: true,
                            shouldValidate: true,
                        });
                        setValue('slug', generateSlug(value));
                    }}
                />

                {errors.name && (
                    <span>
                        {
                            errors.name
                                .message
                        }
                    </span>
                )}
            </div>

            <div className="form-group">
                <label>Slug</label>

                <input
                    type="text"
                    {...register('slug')}
                    placeholder="Ej: camiseta-azul"
                />

                {errors.slug && (
                    <span>
                        {
                            errors.slug
                                .message
                        }
                    </span>
                )}
            </div>

            <div className="form-group">
                <label>
                    Descripción
                </label>

                <textarea
                    {...register(
                        'description'
                    )}
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Precio ($)</label>
                    <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
                </div>

                <div className="form-group">
                    <label>Precio anterior ($)</label>
                    <input type="number" step="0.01" {...register('compareAtPrice', { valueAsNumber: true })} />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Categoría</label>
                    <select {...register('categoryId')}>
                        <option value="">Seleccionar</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Género</label>
                    <select {...register('gender')}>
                        <option value="">Seleccionar</option>
                        <option value="MEN">Hombre</option>
                        <option value="WOMEN">Mujer</option>
                        <option value="UNISEX">Unisex</option>
                    </select>
                </div>
            </div>

            <div className="variants-section">
                <h3>Variantes</h3>
                {variants.map((variant, variantIndex) => (
                    <div key={variantIndex} className="variant-card">
                        <div className="variant-header">
                            <div className="variant-color-name">
                                <div className="variant-color-size">
                                    <label
                                        htmlFor={`variant-name-${variantIndex}`}
                                        className="variant-label"
                                    >
                                        Nombre color
                                    </label>

                                    <input
                                        id={`variant-name-${variantIndex}`}
                                        placeholder="Ej: Negro"
                                        value={variant.name}
                                        onChange={(e) => updateVariantName(variantIndex, e.target.value)}
                                    />
                                </div>

                                <div className="variant-color-size">
                                    <label
                                        htmlFor={`color-${variantIndex}`}
                                        className="variant-label"
                                    >
                                        Color
                                    </label>

                                    <input
                                        id={`color-${variantIndex}`}
                                        type="color"
                                        value={variant.colorHex}
                                        onChange={(e) => updateVariantColor(variantIndex, e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setVariants(
                                        variants.filter((_, i) => i !== variantIndex)
                                    )
                                }
                            >
                                Eliminar color
                            </button>
                        </div>

                        <div className="sizes-section">
                            {variant.sizes.map((size, sizeIndex) => (
                                <div key={sizeIndex} className="size-row">
                                    <div className="variant-color-size">
                                        <label className="variant-label">Talle</label>

                                        <select
                                            value={size.size}
                                            onChange={(e) => updateVariantSize(variantIndex, sizeIndex, e.target.value)}
                                        >
                                            {CLOTHING_SIZES.map((sizeOption) => (
                                                <option
                                                    key={sizeOption}
                                                    value={sizeOption}
                                                >
                                                    {sizeOption}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="variant-color-size">
                                        <label className="variant-label">Stock</label>

                                        <input
                                            type="number"
                                            min={0}
                                            value={size.stock}
                                            onChange={(e) => {
                                                const copy = [...variants];
                                                copy[variantIndex].sizes[sizeIndex].stock =
                                                    Number(e.target.value);
                                                setVariants(copy);
                                            }}
                                        />
                                    </div>

                                    <div className="variant-color-size">
                                        <label className="variant-label">SKU</label>

                                        <input
                                            placeholder="SKU"
                                            value={size.sku}
                                            onChange={(e) => {
                                                const copy = [...variants];
                                                copy[variantIndex].sizes[sizeIndex].sku =
                                                    e.target.value;
                                                setVariants(copy);
                                            }}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const copy = [...variants];

                                            copy[variantIndex].sizes =
                                                copy[variantIndex].sizes.filter(
                                                    (_, i) => i !== sizeIndex
                                                );

                                            setVariants(copy);
                                        }}
                                    >
                                        Eliminar talle
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => {
                                    const copy = [...variants];

                                    copy[variantIndex].sizes.push({
                                        size: 'M',
                                        stock: 0,
                                        sku: buildSku(productSlug, copy[variantIndex].name, 'M'),
                                    });

                                    setVariants(copy);
                                }}
                            >
                                Agregar talle
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() =>
                        setVariants([
                            ...variants,
                            {
                                name: getColorNameFromHex('#000000'),
                                colorHex: '#000000',
                                sizes: [
                                    {
                                        size: 'M',
                                        stock: 0,
                                        sku: buildSku(productSlug, getColorNameFromHex('#000000'), 'M'),
                                    },
                                ],
                            },
                        ])
                    }
                >
                    Agregar color
                </button>

                {variantError && (
                    <span className="variant-error">
                        {variantError}
                    </span>
                )}
            </div>

            <div className="form-group checkbox-group">
                <label>
                    Destacado
                </label>

                <input
                    type="checkbox"
                    {...register(
                        'featured'
                    )}
                />
            </div>

            <div className="form-group checkbox-group">
                <label>
                    Activo
                </label>

                <input
                    type="checkbox"
                    {...register(
                        'active'
                    )}
                />
            </div>

            <div className="form-group">
                <label>Imágenes</label>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={image.onChange}
                />

                <div className="images-preview-list">
                    {existingImages.map((existingImage) => (
                        <div key={existingImage.id} className="image-preview-item">
                            <button
                                type="button"
                                className="remove-image-button"
                                onClick={() =>
                                    setExistingImages((currentImages) =>
                                        currentImages.filter(
                                            (image) => image.id !== existingImage.id
                                        )
                                    )
                                }
                            >
                                ×
                            </button>

                            <Image
                                src={existingImage.url}
                                alt="existing"
                                width={320}
                                height={140}
                                className="image-preview"
                            />
                        </div>
                    ))}

                    {image.previews.length > 0
                        ? image.previews.map((preview, index) => (
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
                        : null}
                </div>
            </div>

            <div className="button-group">
                <button
                    type="button"
                    onClick={close}
                    disabled={
                        isPending ||
                        image.loading
                    }
                    className="cancel-button"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={
                        isPending ||
                        image.loading
                    }
                    className="submit-button"
                >
                    {isPending ||
                        image.loading
                        ? 'Guardando...'
                        : 'Guardar'}
                </button>
            </div>
        </form>
    );
}
