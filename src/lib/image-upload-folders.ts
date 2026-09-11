export const IMAGE_UPLOAD_FOLDERS = ['home', 'banners', 'productos', 'categorias'] as const;
export type ImageUploadFolder = typeof IMAGE_UPLOAD_FOLDERS[number];

export function isImageUploadFolder(value: unknown): value is ImageUploadFolder {
    return typeof value === 'string' && IMAGE_UPLOAD_FOLDERS.some(folder => folder === value);
}
