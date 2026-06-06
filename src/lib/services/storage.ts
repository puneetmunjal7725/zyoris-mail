import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requireStorageEnv() {
  const endpoint = process.env.STORAGE_ENDPOINT;
  const bucket = process.env.STORAGE_BUCKET;
  const accessKeyId = process.env.STORAGE_ACCESS_KEY;
  const secretAccessKey = process.env.STORAGE_SECRET_KEY;
  const region = process.env.STORAGE_REGION || "auto";
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("Attachment storage is not configured (STORAGE_* env vars missing)");
  }
  return { endpoint, bucket, accessKeyId, secretAccessKey, region };
}

function s3Client() {
  const e = requireStorageEnv();
  return new S3Client({
    endpoint: e.endpoint,
    region: e.region,
    forcePathStyle: true,
    credentials: { accessKeyId: e.accessKeyId, secretAccessKey: e.secretAccessKey },
  });
}

export async function uploadObject(key: string, body: Buffer, contentType: string) {
  const e = requireStorageEnv();
  await s3Client().send(new PutObjectCommand({ Bucket: e.bucket, Key: key, Body: body, ContentType: contentType }));
}

export async function signedDownloadUrl(key: string) {
  const e = requireStorageEnv();
  return getSignedUrl(s3Client(), new GetObjectCommand({ Bucket: e.bucket, Key: key }), { expiresIn: 60 * 10 });
}

export async function deleteObject(key: string) {
  const e = requireStorageEnv();
  await s3Client().send(new DeleteObjectCommand({ Bucket: e.bucket, Key: key }));
}
