import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "./config.js";

const s3 = new S3Client({
    endpoint: config.S3_ENDPOINT,
    region: config.S3_REGION,
    credentials: {
        accessKeyId: config.S3_ACCESS_KEY_ID,
        secretAccessKey: config.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});

export async function getPresignedUploadUrl(key: string, contentType: string, expiresIn = 300) {
    const command = new PutObjectCommand({
        Bucket: config.S3_BUCKET,
        Key: key,
        ContentType: contentType,
    });
    return getSignedUrl(s3, command, { expiresIn });
}

export async function downloadObject(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
        Bucket: config.S3_BUCKET,
        Key: key,
    });

    const response = await s3.send(command);
    if (!response.Body) {
        throw new Error("Downloaded object has no content");
    }

    const bytes = await response.Body.transformToByteArray();
    return Buffer.from(bytes);
}
