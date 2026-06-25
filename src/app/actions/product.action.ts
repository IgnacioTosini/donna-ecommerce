'use server';

import { deleteCloudinaryImage } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { serializePrisma } from '@/lib/serializePrisma';
import { CreateProductDto } from '@/schemas';
import { ProductWithRelations } from '@/types';
import { normalizeColorValue } from '@/utils/colorHelpers';
import { normalizeSizeValue } from '@/utils/sizeHelpers';
import type { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const PRODUCT_REVALIDATION_PATHS = [
    '/admin/productos',
    '/',
    '/categoria',
    '/sitemap.xml',
];

function revalidateProductPaths(slugs: Array<string | null | undefined> = []) {
    PRODUCT_REVALIDATION_PATHS.forEach((path) => revalidatePath(path));

    Array.from(new Set(slugs.filter(Boolean))).forEach((slug) => {
        revalidatePath(`/producto/${slug}`);
    });
}

export type ExistingImage = {
    id: string;
    url: string;
    publicId: string;
    order: number;
};

export type NewImage = {
    url: string;
    publicId: string;
    order: number;
};

export type UploadedImage = {
    url: string;
    publicId: string;
    order: number;
};

export async function createProductWithImages({
    data,
    images,
}: {
    data: CreateProductDto;
    images: UploadedImage[];
}) {
    try {
        const product = await prisma.product.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,

                price: data.price,
                compareAtPrice: data.compareAtPrice,

                gender: data.gender,

                featured: data.featured,
                active: data.active,

                categoryId: data.categoryId,

                images: images.length
                    ? {
                        create: images.map((image, index) => ({
                            url: image.url,
                            publicId: image.publicId,
                            order: index,
                        })),
                    }
                    : undefined,

                variants: {
                    create: data.variants.map((variant) => ({
                        name: variant.name,
                        colorHex: normalizeColorValue(variant.colorHex) ?? variant.colorHex,
                        sizes: {
                            create: variant.sizes.map((size) => ({
                                size: size.size,
                                stock: size.stock,
                                sku: size.sku,
                            })),
                        },
                    })),
                },
            },

            include: {
                category: true,
                images: true,
                variants: {
                    include: {
                        sizes: true,
                    },
                },
            },
        });

        revalidateProductPaths([product.slug]);

        return {
            ok: true,
            product: serializePrisma(product),
        };
    } catch (error) {
        console.error(error);

        return {
            ok: false,
            message: 'Error al crear producto',
        };
    }
}

export async function getProducts() {
    const products = await prisma.product.findMany({
        include: {
            category: true,
            images: true,
            variants: {
                include: {
                    sizes: true,
                },
            },
        },

        orderBy: {
            createdAt: 'desc',
        },
    });

    return serializePrisma(products);
}

export async function getProductById(productId: string) {
    const product = await prisma.product.findUnique({
        where: {
            id: productId,
        },

        include: {
            category: true,
            images: {
                orderBy: {
                    order: 'asc',
                },
            },
            variants: {
                include: {
                    sizes: {
                        orderBy: {
                            size: 'asc',
                        },
                    },
                },
            },
        },
    });

    return serializePrisma(product);
}

export async function getProductBySlug(productSlug: string) {
    const product = await prisma.product.findUnique({
        where: {
            slug: productSlug,
        },

        include: {
            category: true,
            images: {
                orderBy: {
                    order: 'asc',
                },
            },
            variants: {
                include: {
                    sizes: {
                        orderBy: {
                            size: 'asc',
                        },
                    },
                },
            },
        },
    });

    return serializePrisma(product);
}

export async function deleteProductWithImages(productId: string) {
    try {
        return await prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({
                where: {
                    id: productId,
                },
                select: {
                    slug: true,
                },
            });

            if (!product) {
                return {
                    ok: false,
                    message: 'Producto no encontrado',
                };
            }

            const images = await tx.productImage.findMany({
                where: {
                    productId,
                },
            });

            for (const image of images) {
                await deleteCloudinaryImage(image.publicId);
            }

            await tx.product.delete({
                where: {
                    id: productId,
                },
            });

            revalidateProductPaths([product.slug]);

            return {
                ok: true,
            };
        });
    } catch (error) {
        console.error(error);

        return {
            ok: false,
            message: 'Error al eliminar el producto',
        };
    }
}

export async function updateProductWithImages(
    productId: string,
    data: CreateProductDto,
    existingImages: ExistingImage[],
    newImages: NewImage[]
) {
    try {
        return await prisma.$transaction(async (tx) => {
            const currentProduct = await tx.product.findUnique({
                where: {
                    id: productId,
                },
                select: {
                    slug: true,
                },
            });

            if (!currentProduct) {
                return {
                    ok: false,
                    message: 'Producto no encontrado',
                };
            }

            const currentImages = await tx.productImage.findMany({
                where: {
                    productId,
                },
            });

            const imagesToDelete = currentImages.filter(
                (current) =>
                    !existingImages.some((image) => image.id === current.id)
            );

            for (const image of imagesToDelete) {
                await deleteCloudinaryImage(image.publicId);
            }

            if (imagesToDelete.length > 0) {
                await tx.productImage.deleteMany({
                    where: {
                        id: {
                            in: imagesToDelete.map((image) => image.id),
                        },
                    },
                });
            }

            await tx.product.update({
                where: {
                    id: productId,
                },
                data: {
                    name: data.name,
                    slug: data.slug,
                    description: data.description,

                    price: data.price,
                    compareAtPrice: data.compareAtPrice,

                    gender: data.gender,

                    featured: data.featured,
                    active: data.active,

                    categoryId: data.categoryId,
                },
            });

            const currentVariants = await tx.productVariant.findMany({
                where: {
                    productId,
                },
                include: {
                    orderItems: {
                        select: {
                            id: true,
                        },
                        take: 1,
                    },
                    sizes: {
                        include: {
                            orderItems: {
                                select: {
                                    id: true,
                                },
                                take: 1,
                            },
                        },
                    },
                },
            });

            const currentVariantsById = new Map(
                currentVariants.map((variant) => [variant.id, variant])
            );
            const submittedVariantIds = new Set(
                data.variants
                    .map((variant) => variant.id)
                    .filter((id): id is string => Boolean(id))
            );

            for (const variant of data.variants) {
                const currentVariant = variant.id
                    ? currentVariantsById.get(variant.id)
                    : null;

                if (!currentVariant) {
                    await tx.productVariant.create({
                        data: {
                            name: variant.name,
                            colorHex: normalizeColorValue(variant.colorHex) ?? variant.colorHex,
                            productId,
                            sizes: {
                                create: variant.sizes.map((size) => ({
                                    size: size.size,
                                    stock: size.stock,
                                    sku: size.sku,
                                })),
                            },
                        },
                    });

                    continue;
                }

                await tx.productVariant.update({
                    where: {
                        id: currentVariant.id,
                    },
                    data: {
                        name: variant.name,
                        colorHex: normalizeColorValue(variant.colorHex) ?? variant.colorHex,
                    },
                });

                const currentSizesById = new Map(
                    currentVariant.sizes.map((size) => [size.id, size])
                );
                const submittedSizeIds = new Set(
                    variant.sizes
                        .map((size) => size.id)
                        .filter((id): id is string => Boolean(id))
                );

                for (const size of variant.sizes) {
                    const currentSize = size.id
                        ? currentSizesById.get(size.id)
                        : null;

                    if (!currentSize) {
                        await tx.productSizeStock.create({
                            data: {
                                variantId: currentVariant.id,
                                size: size.size,
                                stock: size.stock,
                                sku: size.sku,
                            },
                        });

                        continue;
                    }

                    await tx.productSizeStock.update({
                        where: {
                            id: currentSize.id,
                        },
                        data: {
                            size: size.size,
                            stock: size.stock,
                            sku: size.sku,
                        },
                    });
                }

                const removedSizes = currentVariant.sizes.filter(
                    (size) => !submittedSizeIds.has(size.id)
                );

                for (const removedSize of removedSizes) {
                    if (removedSize.orderItems.length > 0) {
                        await tx.productSizeStock.update({
                            where: {
                                id: removedSize.id,
                            },
                            data: {
                                stock: 0,
                            },
                        });

                        continue;
                    }

                    await tx.productSizeStock.delete({
                        where: {
                            id: removedSize.id,
                        },
                    });
                }
            }

            const removedVariants = currentVariants.filter(
                (variant) => !submittedVariantIds.has(variant.id)
            );

            for (const removedVariant of removedVariants) {
                if (removedVariant.orderItems.length > 0) {
                    await tx.productSizeStock.updateMany({
                        where: {
                            variantId: removedVariant.id,
                        },
                        data: {
                            stock: 0,
                        },
                    });

                    continue;
                }

                await tx.productVariant.delete({
                    where: {
                        id: removedVariant.id,
                    },
                });
            }

            if (newImages.length > 0) {
                await tx.productImage.createMany({
                    data: newImages.map((image, index) => ({
                        url: image.url,
                        publicId: image.publicId,
                        order: existingImages.length + index,
                        productId,
                    })),
                });
            }

            const product = await tx.product.findUnique({
                where: {
                    id: productId,
                },

                include: {
                    category: true,
                    images: {
                        orderBy: {
                            order: 'asc',
                        },
                    },
                    variants: {
                        include: {
                            sizes: true,
                        },
                    },
                },
            });

            revalidateProductPaths([currentProduct.slug, product?.slug]);

            return {
                ok: true,
                product: serializePrisma(product),
            };
        });
    } catch (error) {
        console.error(error);

        return {
            ok: false,
            message: 'Error al actualizar el producto',
        };
    }
}

export async function getProductsForTable() {
    const products = await prisma.product.findMany({
        include: {
            category: {
                select: {
                    name: true,
                },
            },

            images: {
                take: 1,
                orderBy: {
                    order: 'asc',
                },
            },

            variants: {
                include: {
                    sizes: {
                        select: {
                            stock: true,
                        },
                    },
                },
            },
        },

        orderBy: {
            createdAt: 'desc',
        },
    });

    return serializePrisma(products) as ProductWithRelations[];
}

export type ProductSortOption = 'newest' | 'priceAsc' | 'priceDesc' | 'featured';

type ProductFilters = {
    category?: string;
    size?: string;
    color?: string;
    maxPrice?: number;
    featured?: boolean;
    sale?: boolean;
    sort?: ProductSortOption;
};

export async function getFilteredProducts({
    category,
    size,
    color,
    maxPrice,
    featured,
    sale,
    sort = 'newest',
}: ProductFilters) {
    const categorySlug = category?.trim().toLowerCase();
    const selectedSize = normalizeSizeValue(size);
    const selectedColor = normalizeColorValue(color);
    const hasMaxPrice =
        typeof maxPrice === 'number' && Number.isFinite(maxPrice);

    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
        sort === 'priceAsc'
            ? [{ price: 'asc' }]
            : sort === 'priceDesc'
                ? [{ price: 'desc' }]
                : sort === 'featured'
                    ? [{ featured: 'desc' }, { createdAt: 'desc' }]
                    : [{ createdAt: 'desc' }];

    const where: Prisma.ProductWhereInput = {
        active: true,
        ...(categorySlug
            ? {
                category: {
                    slug: categorySlug,
                },
            }
            : {}),
        ...(hasMaxPrice
            ? {
                price: {
                    lte: maxPrice,
                },
            }
            : {}),
        ...(featured
            ? {
                featured: true,
            }
            : {}),
        ...(sale
            ? {
                compareAtPrice: {
                    gt: prisma.product.fields.price,
                },
            }
            : {}),
        variants: {
            some: {
                ...(selectedColor
                    ? {
                        colorHex: {
                            equals: selectedColor,
                            mode: 'insensitive',
                        },
                    }
                    : {}),
                sizes: {
                    some: {
                        ...(selectedSize
                            ? {
                                size: selectedSize,
                            }
                            : {}),
                        stock: {
                            gt: 0,
                        },
                    },
                },
            },
        },
    };

    const products = await prisma.product.findMany({
        where,
        include: {
            category: true,
            images: {
                orderBy: {
                    order: 'asc',
                },
            },
            variants: {
                include: {
                    sizes: {
                        orderBy: {
                            size: 'asc',
                        },
                    },
                },
            },
        },
        orderBy,
    });

    return serializePrisma(products) as ProductWithRelations[];
}
