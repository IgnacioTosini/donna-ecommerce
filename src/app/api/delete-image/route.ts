import { NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { isAdminAuthenticated } from "@/lib/admin-session";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

const buildSignature = (params: Record<string, string | number>, apiSecret: string) => {
    const payload = Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

    return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
};

export async function DELETE(req: NextRequest) {
    if (!(await isAdminAuthenticated())) {
        return Response.json(
            { success: false, error: "No autorizado." },
            { status: 401 }
        );
    }

    const publicId = req.nextUrl.searchParams.get("publicId");

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        return Response.json(
            { success: false, error: "Faltan variables CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET" },
            { status: 500 }
        );
    }

    if (!publicId) {
        return Response.json({ error: "Falta el identificador de la imagen." }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = buildSignature(
        {
            invalidate: "true",
            public_id: publicId,
            timestamp,
        },
        CLOUDINARY_API_SECRET
    );

    const body = new URLSearchParams({
        public_id: publicId,
        api_key: CLOUDINARY_API_KEY,
        invalidate: "true",
        timestamp: String(timestamp),
        signature,
    });

    const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
            cache: "no-store",
        }
    );

    const data = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok) {
        return Response.json(
            {
                success: false,
                error: data?.error?.message ?? "No se pudo eliminar la imagen.",
            },
            { status: cloudinaryResponse.status }
        );
    }

    const success = data?.result === "ok" || data?.result === "not found";

    return Response.json({
        success,
        result: data?.result,
        error: success ? undefined : "Cloudinary no pudo eliminar la imagen",
    });
}
