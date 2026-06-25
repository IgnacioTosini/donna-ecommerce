'use client';

import { useState } from 'react';
import { ImageService } from '@/services/ImageService';
import { toast } from 'react-toastify';

type UploadOptions = {
    maxWidth: number;
    maxHeight: number;
    format?: 'jpeg' | 'webp' | 'png';
    enableOptimization?: boolean;
};

export type UploadedImage = {
    url: string;
    publicId: string;
    order: number;
};

export function useImageUpload() {
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files ?? []);

        if (!selectedFiles.length) return;

        previews.forEach((preview) => URL.revokeObjectURL(preview));

        setFiles(selectedFiles);
        setPreviews(
            selectedFiles.map((file) => URL.createObjectURL(file))
        );
    };

    const uploadMany = async (options: UploadOptions): Promise<UploadedImage[]> => {
        if (!files.length) return [];

        setLoading(true);

        try {
            const uploadedImages = await Promise.all(
                files.map(async (file, index) => {
                    const res = await ImageService.uploadImage(file, options);

                    if (!res.success) {
                        throw new Error(res.error ?? 'No se pudo subir la imagen.');
                    }

                    return {
                        url: res.url,
                        publicId: res.public_id,
                        order: index,
                    };
                })
            );

            return uploadedImages.filter(Boolean) as UploadedImage[];
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'No se pudo subir la imagen.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        previews.forEach((preview) => URL.revokeObjectURL(preview));

        setFiles([]);
        setPreviews([]);
    };

    const remove = (index: number) => {
        URL.revokeObjectURL(previews[index]);

        setFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    return {
        files,
        previews,
        loading,
        onChange,
        uploadMany,
        reset,
        remove,
    };
}
