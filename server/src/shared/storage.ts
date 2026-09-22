import { v2 as cloudinary } from "cloudinary";
import { config } from "./config.js";

cloudinary.config({
    cloud_name: config.CLOUD_NAME,
    api_key: config.CLOUD_API_KEY,
    api_secret: config.CLOUD_SECRET_KEY,
    secure: true,
});

export function getSignedUploadParams(key: string) {
    const timestamp = Math.floor(Date.now() / 1000);
    const type = "authenticated";
    const allowedFormats = "pdf";
    const signature = cloudinary.utils.api_sign_request(
        { allowed_formats: allowedFormats, public_id: key, timestamp, type },
        config.CLOUD_SECRET_KEY
    );

    return {
        uploadUrl: `https://api.cloudinary.com/v1_1/${config.CLOUD_NAME}/raw/upload`,
        key,
        timestamp,
        signature,
        apiKey: config.CLOUD_API_KEY,
        type,
        allowedFormats,
    };
}

export function getPrivateDownloadUrl(key: string) {
    return cloudinary.utils.private_download_url(key, "", {
        resource_type: "raw",
        type: "authenticated",
        expires_at: Math.floor(Date.now() / 1000) + 300,
    });
}

export async function downloadObject(key: string): Promise<Buffer> {
    const downloadUrl = getPrivateDownloadUrl(key);

    const response = await fetch(downloadUrl);
    if (!response.ok) {
        throw new Error(`Failed to download résumé: ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
}
