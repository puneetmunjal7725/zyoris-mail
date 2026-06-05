import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "@/lib/env";

const env = () => getEnv();

function s3Client() {
  const e = env();
  return new S3Client({
    endpoint: e.STORAGE_ENDPOINT,
    region: e.STORAGE_REGION,
    forcePathStyle: true,
    credentials: { accessKeyId: e.STORAGE_ACCESS_KEY, secretAccessKey: e.STORAGE_SECRET_KEY },
  });
}

export async function uploadObject(key: string, body: Buffer, contentType: string) {
  const e = env();
  await s3Client().send(new PutObjectCommand({ Bucket: e.STORAGE_BUCKET, Key: key, Body: body, ContentType: contentType }));
}

export async function signedDownloadUrl(key: string) {
  const e = env();
  return getSignedUrl(s3Client(), new GetObjectCommand({ Bucket: e.STORAGE_BUCKET, Key: key }), { expiresIn: 60 * 10 });
}

export async function deleteObject(key: string) {
  const e = env();
  await s3Client().send(new DeleteObjectCommand({ Bucket: e.STORAGE_BUCKET, Key: key }));
}
