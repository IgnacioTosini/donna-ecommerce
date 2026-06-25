import axios from "axios";

export type CloudinaryUploadResponse = {
    success: boolean;
    url: string;
    public_id: string;
    error?: string;
    originalSize?: number;
    optimizedSize?: number;
    compressionRatio?: number;
};

export interface ImageOptimizationOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'webp' | 'png';
    maxSizeKB?: number;
    enableOptimization?: boolean;
}

export class ImageService {
    /**
     * Optimiza una imagen antes de subirla
     */
    static async optimizeImage(
        file: File,
        options: ImageOptimizationOptions = {}
    ): Promise<{ file: File; stats: { originalSize: number; optimizedSize: number; compressionRatio: number } }> {
        const {
            maxWidth = 1280,
            maxHeight = 720,
            quality = 0.9,
            format = 'webp',
            maxSizeKB = 300
        } = options;

        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                try {
                    let { width, height } = img;

                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }

                    canvas.width = width;
                    canvas.height = height;

                    if (ctx) {
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, 0, 0, width, height);
                    }

                    const toBlob = (q: number): Promise<Blob> =>
                        new Promise<Blob>((res) =>
                            canvas.toBlob((b) => res(b!), `image/${format}`, q)
                        );

                    // Primero intentar con la calidad indicada
                    // Si supera el límite, usar búsqueda binaria para encontrar
                    // la calidad más alta posible que respete el tamaño objetivo
                    const findOptimalBlob = async (): Promise<Blob> => {
                        const initial = await toBlob(quality);
                        if (initial.size <= maxSizeKB * 1024) return initial;

                        let low = 0.1;
                        let high = quality;
                        let best = initial;

                        for (let i = 0; i < 8; i++) {
                            const mid = (low + high) / 2;
                            const candidate = await toBlob(mid);
                            if (candidate.size <= maxSizeKB * 1024) {
                                best = candidate;
                                low = mid;
                            } else {
                                high = mid;
                            }
                        }

                        return best;
                    };

                    findOptimalBlob().then((optimizedBlob) => {
                        const ext = format === 'jpeg' ? 'jpg' : format;
                        const optimizedFile = new File(
                            [optimizedBlob],
                            file.name.replace(/\.[^/.]+$/, `.${ext}`),
                            { type: `image/${format}`, lastModified: Date.now() }
                        );

                        const stats = {
                            originalSize: file.size,
                            optimizedSize: optimizedBlob.size,
                            compressionRatio: Math.round(((file.size - optimizedBlob.size) / file.size) * 100)
                        };

                        resolve({ file: optimizedFile, stats });
                    }).catch(reject);

                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('Error al cargar la imagen'));
            };
            img.src = objectUrl;
        });
    }

    static async uploadImage(
        file: File,
        options: ImageOptimizationOptions = { enableOptimization: true, format: 'webp' }
    ): Promise<CloudinaryUploadResponse> {
        try {
            let fileToUpload = file;

            if (options.enableOptimization && file.type.startsWith("image/")) {
                const optimized = await this.optimizeImage(file, options);
                fileToUpload = optimized.file;
            }

            const formData = new FormData();
            formData.append("file", fileToUpload);

            const response = await axios.post("/api/upload-image", formData);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError<{ error?: string }>(error)) {
                return {
                    success: false,
                    url: "",
                    public_id: "",
                    error: error.response?.data?.error ?? "No se pudo subir la imagen.",
                };
            }

            return {
                success: false,
                url: "",
                public_id: "",
                error: "No se pudo procesar la imagen.",
            };
        }
    }

    static async deleteImage(publicId: string) {
        try {
            const response = await axios.delete(
                `/api/delete-image?publicId=${encodeURIComponent(publicId)}`
            );

            return response.data;
        } catch (error) {
            if (axios.isAxiosError<{ error?: string }>(error)) {
                return {
                    success: false,
                    error: error.response?.data?.error ?? "No se pudo eliminar la imagen.",
                };
            }

            return {
                success: false,
                error: "No se pudo eliminar la imagen.",
            };
        }
    }
}
