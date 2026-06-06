import crypto from "crypto";
import { z } from "zod";

const mailEnvSchema = z.object({
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

const fullEnvSchema = mailEnvSchema.extend({
  NEXTAUTH_SECRET: z.string().min(16),
  MONGODB_URI: z.string().min(10),
  REDIS_URL: z.string().url().optional(),
  STORAGE_ENDPOINT: z.string().url().optional(),
  STORAGE_BUCKET: z.string().min(3).optional(),
  STORAGE_ACCESS_KEY: z.string().min(3).optional(),
  STORAGE_SECRET_KEY: z.string().min(3).optional(),
  STORAGE_REGION: z.string().default("auto"),
});

let mailParsed: z.infer<typeof mailEnvSchema> | null = null;
let fullParsed: z.infer<typeof fullEnvSchema> | null = null;

export function getMailEnv() {
  if (mailParsed) return mailParsed;
  mailParsed = mailEnvSchema.parse({
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || "RESEND",
    FROM_EMAIL: process.env.FROM_EMAIL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
  });
  return mailParsed;
}

export function getEnv() {
  if (fullParsed) return fullParsed;
  fullParsed = fullEnvSchema.parse({
    ...getMailEnv(),
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
    REDIS_URL: process.env.REDIS_URL,
    STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT,
    STORAGE_BUCKET: process.env.STORAGE_BUCKET,
    STORAGE_ACCESS_KEY: process.env.STORAGE_ACCESS_KEY,
    STORAGE_SECRET_KEY: process.env.STORAGE_SECRET_KEY,
    STORAGE_REGION: process.env.STORAGE_REGION || "auto",
  });
  return fullParsed;
}

export const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function randomOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
