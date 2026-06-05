import crypto from "crypto";
import { z } from "zod";

const envSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(16),
  MONGODB_URI: z.string().min(10),
  REDIS_URL: z.string().url(),
  STORAGE_ENDPOINT: z.string().url(),
  STORAGE_BUCKET: z.string().min(3),
  STORAGE_ACCESS_KEY: z.string().min(3),
  STORAGE_SECRET_KEY: z.string().min(3),
  STORAGE_REGION: z.string().default("auto"),
  EMAIL_PROVIDER: z.enum(["RESEND", "MAILGUN", "SMTP"]),
  FROM_EMAIL: z.string().email(),
  RESEND_API_KEY: z.string().optional(),
  MAILGUN_API_KEY: z.string().optional(),
  MAILGUN_DOMAIN: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

let parsed: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (parsed) return parsed;
  parsed = envSchema.parse(process.env);
  return parsed;
}

export const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function randomOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
