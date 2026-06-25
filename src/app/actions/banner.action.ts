'use server';

import { deleteCloudinaryImage } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { serializePrisma } from '@/lib/serializePrisma';
import { CreateBannerDto } from '@/schemas';
import { Banner } from '@/types';
import { BannerPlacement } from '@prisma/client';
import { revalidatePath } from 'next/cache';

type UploadedImage = {
    url: string;
    publicId: string;
};

export async function createBannerWithImage({
    data,
    image,
}: {
    data: CreateBannerDto;
    image: UploadedImage;
}) {
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

        revalidatePath('/admin/banners');
        revalidatePath('/');

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

            revalidatePath('/admin/banners');
            revalidatePath('/');

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

            revalidatePath('/admin/banners');
            revalidatePath('/');

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
    const banners = await prisma.banner.findMany({
        orderBy: {
            order: 'asc',
        },
    });

    return serializePrisma(banners) as Banner[];
}

export async function getBannerById(bannerId: string): Promise<Banner | null> {
    const banner = await prisma.banner.findUnique({
        where: { id: bannerId },
    });

    return serializePrisma(banner) as Banner | null;
}

export async function getBannersByPlacement(
    placement: BannerPlacement
): Promise<Banner[]> {
    const banners = await prisma.banner.findMany({
        where: {
            placement,
            active: true,
        },
        orderBy: {
            order: 'asc',
        },
    });

    return serializePrisma(banners) as Banner[];
}