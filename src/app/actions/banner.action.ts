'use server';

import { deleteCloudinaryImage } from '@/lib/cloudinary';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { STOREFRONT_CACHE_SECONDS, STOREFRONT_CACHE_TAG } from '@/lib/cache-tags';
import { prisma } from '@/lib/prisma';
import { serializePrisma } from '@/lib/serializePrisma';
import { CreateBannerDto } from '@/schemas';
import { Banner } from '@/types';
import { BannerPlacement } from '@prisma/client';
import { revalidatePath, unstable_cache, updateTag } from 'next/cache';

type UploadedImage = {
    url: string;
    publicId: string;
};

const revalidateBannerPaths = () => {
    updateTag(STOREFRONT_CACHE_TAG);
    revalidatePath('/admin/banners');
    revalidatePath('/');
};

export async function createBannerWithImage({
    data,
    image,
}: {
    data: CreateBannerDto;
    image: UploadedImage;
}) {
    if (!(await isAdminAuthenticated())) {
        return { ok: false, message: 'No autorizado' };
    }

    try {
        const banner = await prisma.banner.create({
            data: {
                span: data.span,
                title: data.title,
                subtitle: data.subtitle,
                buttonText: data.buttonText,
                buttonLink: data.buttonLink,
                active: data.active,
                order: data.order,
                imageUrl: image.url,
                publicId: image.publicId,
                placement: data.placement,
            },
        });

        revalidateBannerPaths();

        return {
            ok: true,
            banner: serializePrisma(banner),
        };
    } catch (error) {
        console.error(error);

        return {
            ok: false,
            message: 'Error al crear el banner',
        };
    }
}

export async function updateBannerWithImage(
    bannerId: string,
    data: CreateBannerDto,
    image?: UploadedImage
) {
    if (!(await isAdminAuthenticated())) {
        return { ok: false, message: 'No autorizado' };
    }

    try {
        return await prisma.$transaction(async (tx) => {
            const currentBanner = await tx.banner.findUnique({
                where: { id: bannerId },
            });

            if (!currentBanner) {
                return {
                    ok: false,
                    message: 'Banner no encontrado',
                };
            }

            let imageUrl = currentBanner.imageUrl;
            let publicId = currentBanner.publicId;

            if (image) {
                await deleteCloudinaryImage(currentBanner.publicId);

                imageUrl = image.url;
                publicId = image.publicId;
            }

            const banner = await tx.banner.update({
                where: { id: bannerId },
                data: {
                    span: data.span,
                    title: data.title,
                    subtitle: data.subtitle,
                    buttonText: data.buttonText,
                    buttonLink: data.buttonLink,
                    active: data.active,
                    order: data.order,
                    imageUrl,
                    publicId,
                    placement: data.placement,
                },
            });

            revalidateBannerPaths();

            return {
                ok: true,
                banner: serializePrisma(banner),
            };
        });
    } catch (error) {
        console.error(error);

        return {
            ok: false,
            message: 'Error al actualizar el banner',
        };
    }
}

export async function deleteBannerWithImage(bannerId: string) {
    if (!(await isAdminAuthenticated())) {
        return { ok: false, message: 'No autorizado' };
    }

    try {
        return await prisma.$transaction(async (tx) => {
            const banner = await tx.banner.findUnique({
                where: { id: bannerId },
            });

            if (!banner) {
                return {
                    ok: false,
                    message: 'Banner no encontrado',
                };
            }

            await deleteCloudinaryImage(banner.publicId);

            await tx.banner.delete({
                where: { id: bannerId },
            });

            revalidateBannerPaths();

            return { ok: true };
        });
    } catch (error) {
        console.error(error);

        return {
            ok: false,
            message: 'Error al eliminar el banner',
        };
    }
}

export async function getBanners(): Promise<Banner[]> {
    if (!(await isAdminAuthenticated())) {
        throw new Error('No autorizado');
    }

    const banners = await prisma.banner.findMany({
        orderBy: {
            order: 'asc',
        },
    });

    return serializePrisma(banners) as Banner[];
}

export async function getBannerById(bannerId: string): Promise<Banner | null> {
    if (!(await isAdminAuthenticated())) {
        throw new Error('No autorizado');
    }

    const banner = await prisma.banner.findUnique({
        where: { id: bannerId },
    });

    return serializePrisma(banner) as Banner | null;
}

export async function getBannersByPlacement(
    placement: BannerPlacement
): Promise<Banner[]> {
    const banners = await getActiveBannersCached();

    return banners.filter((banner) => banner.placement === placement);
}

export async function getActiveBanners(): Promise<Banner[]> {
    return getActiveBannersCached();
}

const getActiveBannersCached = unstable_cache(
    async () => {
        const banners = await prisma.banner.findMany({
            where: {
                active: true,
            },
            orderBy: [
                { placement: 'asc' },
                { order: 'asc' },
            ],
        });

        return serializePrisma(banners) as Banner[];
    },
    ['active-banners'],
    {
        revalidate: STOREFRONT_CACHE_SECONDS,
        tags: [STOREFRONT_CACHE_TAG],
    }
);
