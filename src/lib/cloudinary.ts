import { createHash } from "crypto";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;

function buildSignature(
    params: Record<string, string | number>
) {
    const payload = Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

    return createHash("sha1")
        .update(`${payload}${CLOUDINARY_API_SECRET}`)
        .digest("hex");
}

export async function deleteCloudinaryImage(
    publicId: string
) {
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = buildSignature({
        public_id: publicId,
        invalidate: "true",
        timestamp,
    });

    const body = new URLSearchParams({
        public_id: publicId,
        api_key: CLOUDINARY_API_KEY,
        invalidate: "true",
        timestamp: String(timestamp),
        signature,
    });

    await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded",
            },
            body,
        }
    );
}