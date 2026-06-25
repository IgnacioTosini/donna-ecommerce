import { NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { isAdminAuthenticated } from "@/lib/admin-session";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "Crosti Focaccias";

const buildSignature = (params: Record<string, string | number>, apiSecret: string) => {
    const payload = Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

    return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
};

export async function POST(req: NextRequest) {
    if (!(await isAdminAuthenticated())) {
        return Response.json(
            { success: false, error: "No autorizado." },
            { status: 401 }
        );
    }

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        return Response.json(
            { success: false, error: "Faltan variables CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET" },
            { status: 500 }
        );
    }

    const incomingForm = await req.formData();
    const file = incomingForm.get("file");

    if (!(file instanceof File)) {
        return Response.json(
            { success: false, error: "Falta seleccionar una imagen." },
            { status: 400 }
        );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = buildSignature(
        {
            folder: CLOUDINARY_UPLOAD_FOLDER,
            timestamp,
        },
        CLOUDINARY_API_SECRET
    );

    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", file);
    cloudinaryForm.append("api_key", CLOUDINARY_API_KEY);
    cloudinaryForm.append("timestamp", String(timestamp));
    cloudinaryForm.append("folder", CLOUDINARY_UPLOAD_FOLDER);
    cloudinaryForm.append("signature", signature);

    const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: cloudinaryForm,
            cache: "no-store",
        }
    );

    const data = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok) {
        return Response.json(
            {
                success: false,
                error: data?.error?.message ?? "No se pudo subir la imagen.",
            },
            { status: cloudinaryResponse.status }
        );
    }

    return Response.json({
        success: true,
        url: data.secure_url,
        public_id: data.public_id,
    });
}
