'use server';

import { deleteCloudinaryImage } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { serializePrisma } from '@/lib/serializePrisma';
import { CreateCategoryDto } from '@/schemas';
import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';

const CATEGORY_REVALIDATION_PATHS = [
    '/admin/categorias',
    '/',
    '/categoria',
    '/sitemap.xml',
];

function revalidateCategoryPaths() {
    CATEGORY_REVALIDATION_PATHS.forEach((path) => revalidatePath(path));
}

type UploadedImage = {
    url: string;
    publicId: string;
};

const CATEGORY_WITH_PRODUCT_COUNT_SELECT = {
    id: true,
    name: true,
    slug: true,
    description: true,
    imageUrl: true,
    publicId: true,
    createdAt: true,
    updatedAt: true,
    _count: {
        select: {
            products: true,
        },
    },
} satisfies Prisma.CategorySelect;

export async function createCategoryWithImage({
    data,
    image,
}: {
    data: CreateCategoryDto;
    image?: UploadedImage;
}) {
    try {
        const category = await prisma.category.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,

                imageUrl: image?.url,
                publicId: image?.publicId,
            },
        });

        revalidateCategoryPaths();

        return {
            ok: true,
            category: serializePrisma(category),
        };
    } catch (error) {
        console.error(error);

        return {
            ok: false,
            message: 'Error al crear la categoría',
        };
    }
}

export async function updateCategoryWithImage(
    categoryId: string,
    data: CreateCategoryDto,
    image?: UploadedImage
) {
    try {
        return await prisma.$transaction(async (tx) => {
            const currentCategory =
                await tx.category.findUnique({
                    where: {
                        id: categoryId,
                    },
                });

            if (!currentCategory) {
                return {
                    ok: false,
                    message: 'Categoría no encontrada',
                };
            }

            let imageUrl = currentCategory.imageUrl;
            let publicId = currentCategory.publicId;

            if (image) {
                if (currentCategory.publicId) {
                    await deleteCloudinaryImage(
                        currentCategory.publicId
                    );
                }

                imageUrl = image.url;
                publicId = image.publicId;
            }

            const category =
                await tx.category.update({
                    where: {
                        id: categoryId,
                    },
                    data: {
                        name: data.name,
                        slug: data.slug,
                        description: data.description,

                        imageUrl,
                        publicId,
                    },
                });

            revalidateCategoryPaths();

            return {
                ok: true,
                category: serializePrisma(category),
            };
        });
    } catch (error) {
        console.error(error);

        return {
            ok: false,
            message: 'Error al actualizar la categoría',
        };
    }
}

export async function deleteCategoryWithImage(
    categoryId: string
) {
    try {
        return await prisma.$transaction(async (tx) => {
            const category =
                await tx.category.findUnique({
                    where: {
                        id: categoryId,
                    },
                    include: {
                        _count: {
                            select: {
                                products: true,
                            },
                        },
                    },
                });

            if (!category) {
                return {
                    ok: false,
                    message: 'Categoría no encontrada',
                };
            }

            if (category._count.products > 0) {
                return {
                    ok: false,
                    message:
                        'No puedes eliminar una categoría con productos asociados',
                };
            }

            if (category.publicId) {
                await deleteCloudinaryImage(
                    category.publicId
                );
            }

            await tx.category.delete({
                where: {
                    id: categoryId,
                },
            });

            revalidateCategoryPaths();

            return {
                ok: true,
            };
        });
    } catch (error) {
        console.error(error);

        return {
            ok: false,
            message: 'Error al eliminar la categoría',
        };
    }
}

export async function getCategories() {
    const categories =
        await prisma.category.findMany({
            orderBy: {
                name: 'asc',
            },
            include: {
                products: true,
            },
        });

    return serializePrisma(categories);
}

export async function getCategoriesWithProductCount() {
    const categories =
        await prisma.category.findMany({
            orderBy: {
                name: 'asc',
            },
            select: CATEGORY_WITH_PRODUCT_COUNT_SELECT,
        });

    return serializePrisma(
        categories.map(({ _count, ...category }) => ({
            ...category,
            productsCount: _count.products,
        }))
    );
}

export async function getCategoryById(
    categoryId: string
) {
    const category =
        await prisma.category.findUnique({
            where: {
                id: categoryId,
            },
            include: {
                products: true,
            },
        });

    return serializePrisma(category);
}
