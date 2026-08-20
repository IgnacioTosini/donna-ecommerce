'use server';

import { deleteCloudinaryImage } from '@/lib/cloudinary';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { STOREFRONT_CACHE_SECONDS, STOREFRONT_CACHE_TAG } from '@/lib/cache-tags';
import { prisma } from '@/lib/prisma';
import { serializePrisma } from '@/lib/serializePrisma';
import { CreateProductDto } from '@/schemas';
import { ProductListItem, ProductWithRelations } from '@/types';
import { normalizeColorValue } from '@/utils/colorHelpers';
import { PRODUCT_SIZE_ORDER, normalizeSizeValue, sizesMatch, sortProductSizes } from '@/utils/sizeHelpers';
import { Gender, type Prisma } from '@prisma/client';
import { revalidatePath, unstable_cache, updateTag } from 'next/cache';
import { cache } from 'react';

const PRODUCT_REVALIDATION_PATHS = [
    '/admin/productos',
    '/',
    '/categoria',
    '/sitemap.xml',
];

function revalidateProductPaths(slugs: Array<string | null | undefined> = []) {
    updateTag(STOREFRONT_CACHE_TAG);
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
    if (!(await isAdminAuthenticated())) {
        return { ok: false, message: 'No autorizado' };
    }

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
    if (!(await isAdminAuthenticated())) {
        throw new Error('No autorizado');
    }

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

export async function getHomeProductSections() {
    return getHomeProductSectionsCached();
}

export async function getActiveProductsForSitemap() {
    return getActiveProductsForSitemapCached();
}

export async function getProductById(productId: string) {
    if (!(await isAdminAuthenticated())) {
        throw new Error('No autorizado');
    }

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
    return getProductBySlugForRequest(productSlug);
}

export async function deleteProductWithImages(productId: string) {
    if (!(await isAdminAuthenticated())) {
        return { ok: false, message: 'No autorizado' };
    }

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
    if (!(await isAdminAuthenticated())) {
        return { ok: false, message: 'No autorizado' };
    }

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
    if (!(await isAdminAuthenticated())) {
        throw new Error('No autorizado');
    }

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
    gender?: Gender;
    size?: string;
    color?: string;
    maxPrice?: number;
    featured?: boolean;
    sale?: boolean;
    sort?: ProductSortOption;
};

type ProductPaginationFilters = ProductFilters & {
    page?: number;
    pageSize?: number;
};

export type ProductFilterOptions = {
    sizes: string[];
    colors: string[];
    minPrice: number;
    maxPrice: number;
};

const PRODUCT_LIST_SELECT = {
    id: true,
    name: true,
    slug: true,
    price: true,
    compareAtPrice: true,
    gender: true,
    category: {
        select: {
            name: true,
        },
    },
    images: {
        select: {
            id: true,
            url: true,
        },
        orderBy: {
            order: 'asc',
        },
    },
    variants: {
        select: {
            id: true,
            name: true,
            colorHex: true,
            sizes: {
                select: {
                    id: true,
                    size: true,
                    stock: true,
                },
                orderBy: {
                    size: 'asc',
                },
            },
        },
    },
} satisfies Prisma.ProductSelect;

const PRODUCT_DETAIL_INCLUDE = {
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
} satisfies Prisma.ProductInclude;

const getHomeProductSectionsCached = unstable_cache(
    async () => {
        const [bestSellers, newArrivals] = await Promise.all([
            prisma.product.findMany({
                where: {
                    active: true,
                    featured: true,
                },
                select: PRODUCT_LIST_SELECT,
                orderBy: {
                    createdAt: 'desc',
                },
                take: 4,
            }),
            prisma.product.findMany({
                where: {
                    active: true,
                },
                select: PRODUCT_LIST_SELECT,
                orderBy: {
                    createdAt: 'desc',
                },
                take: 4,
            }),
        ]);

        return {
            bestSellers: serializePrisma(bestSellers) as ProductListItem[],
            newArrivals: serializePrisma(newArrivals) as ProductListItem[],
        };
    },
    ['home-product-sections'],
    {
        revalidate: STOREFRONT_CACHE_SECONDS,
        tags: [STOREFRONT_CACHE_TAG],
    }
);

const getActiveProductsForSitemapCached = unstable_cache(
    async () => {
        const products = await prisma.product.findMany({
            where: {
                active: true,
            },
            select: {
                slug: true,
                updatedAt: true,
                featured: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return serializePrisma(products);
    },
    ['active-products-sitemap'],
    {
        revalidate: STOREFRONT_CACHE_SECONDS,
        tags: [STOREFRONT_CACHE_TAG],
    }
);

const getProductBySlugCached = unstable_cache(
    async (productSlug: string) => {
        const product = await prisma.product.findUnique({
            where: {
                slug: productSlug,
                active: true,
            },
            include: PRODUCT_DETAIL_INCLUDE,
        });

        return serializePrisma(product);
    },
    ['product-by-slug'],
    {
        revalidate: STOREFRONT_CACHE_SECONDS,
        tags: [STOREFRONT_CACHE_TAG],
    }
);

const getProductBySlugForRequest = cache((productSlug: string) =>
    getProductBySlugCached(productSlug)
);

const buildFilteredProductsOrderBy = (
    sort: ProductSortOption = 'newest'
): Prisma.ProductOrderByWithRelationInput[] =>
    sort === 'priceAsc'
        ? [{ price: 'asc' }]
        : sort === 'priceDesc'
            ? [{ price: 'desc' }]
            : sort === 'featured'
                ? [{ featured: 'desc' }, { createdAt: 'desc' }]
                : [{ createdAt: 'desc' }];

const buildFilteredProductsWhere = ({
    category,
    gender,
    size,
    color,
    maxPrice,
    featured,
    sale,
}: ProductFilters): Prisma.ProductWhereInput => {
    const categorySlug = category?.trim().toLowerCase();
    const selectedSize = normalizeSizeValue(size);
    const selectedColor = normalizeColorValue(color);
    const hasMaxPrice =
        typeof maxPrice === 'number' && Number.isFinite(maxPrice);

    return {
        active: true,
        ...(categorySlug
            ? {
                category: {
                    slug: categorySlug,
                },
            }
            : {}),
        ...(gender
            ? {
                gender,
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
};

const getCategoryFilterOptionsCached = unstable_cache(
    async (filters: ProductFilters): Promise<ProductFilterOptions> => {
        const where = buildFilteredProductsWhere(filters);
        const globalPriceWhere = buildFilteredProductsWhere({});
        const activeSize = normalizeSizeValue(filters.size);
        const [facetProducts, priceRange] = await Promise.all([
            prisma.product.findMany({
                where,
                select: {
                    variants: {
                        select: {
                            colorHex: true,
                            sizes: {
                                select: {
                                    size: true,
                                    stock: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.product.aggregate({
                where: globalPriceWhere,
                _min: {
                    price: true,
                },
                _max: {
                    price: true,
                },
            }),
        ]);

        const sizes = new Set<string>(PRODUCT_SIZE_ORDER);
        const colors = new Set<string>();

        facetProducts.forEach((product) => {
            product.variants.forEach((variant) => {
                const hasAvailableStock = variant.sizes.some((size) =>
                    size.stock > 0
                    && (!activeSize || sizesMatch(size.size, activeSize))
                );
                const color = normalizeColorValue(variant.colorHex);

                if (hasAvailableStock && color) {
                    colors.add(color);
                }

                variant.sizes.forEach((size) => sizes.add(size.size));
            });
        });

        return {
            sizes: sortProductSizes([...sizes]),
            colors: [...colors].sort(),
            minPrice: priceRange._min.price
                ? Math.floor(Number(priceRange._min.price))
                : 0,
            maxPrice: priceRange._max.price
                ? Math.ceil(Number(priceRange._max.price))
                : 0,
        };
    },
    ['category-filter-options'],
    {
        revalidate: STOREFRONT_CACHE_SECONDS,
        tags: [STOREFRONT_CACHE_TAG],
    }
);

const getPaginatedFilteredProductsCached = unstable_cache(
    async ({
        page = 1,
        pageSize = 10,
        ...filters
    }: ProductPaginationFilters) => {
        const where = buildFilteredProductsWhere(filters);
        const orderBy = buildFilteredProductsOrderBy(filters.sort);
        const safePageSize = Math.min(Math.max(Math.floor(pageSize), 1), 60);
        const requestedPage = Math.max(Math.floor(page), 1);
        const totalProducts = await prisma.product.count({ where });
        const totalPages = Math.max(1, Math.ceil(totalProducts / safePageSize));
        const currentPage = Math.min(requestedPage, totalPages);

        const products = await prisma.product.findMany({
            where,
            select: PRODUCT_LIST_SELECT,
            orderBy,
            skip: (currentPage - 1) * safePageSize,
            take: safePageSize,
        });

        return {
            products: serializePrisma(products) as ProductListItem[],
            totalProducts,
            totalPages,
            currentPage,
            pageSize: safePageSize,
        };
    },
    ['paginated-filtered-products'],
    {
        revalidate: STOREFRONT_CACHE_SECONDS,
        tags: [STOREFRONT_CACHE_TAG],
    }
);

export async function getCategoryFilterOptions(filters: ProductFilters) {
    return getCategoryFilterOptionsCached(filters);
}

export async function getPaginatedFilteredProducts(
    filters: ProductPaginationFilters
) {
    return getPaginatedFilteredProductsCached(filters);
}
