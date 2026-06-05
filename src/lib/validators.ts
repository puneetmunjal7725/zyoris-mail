import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
  organizationName: z.string().min(2),
});

export const loginSchema = z.object({ email: z.string().email().toLowerCase(), password: z.string().min(8) });

export const forgotPasswordSchema = z.object({ email: z.string().email().toLowerCase() });

export const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8).max(128),
});

export const sendOtpSchema = z.object({ email: z.string().email().toLowerCase(), purpose: z.enum(["VERIFY_EMAIL", "RESET_PASSWORD", "LOGIN_2FA"]) });
export const verifyOtpSchema = z.object({ email: z.string().email().toLowerCase(), purpose: z.enum(["VERIFY_EMAIL", "RESET_PASSWORD", "LOGIN_2FA"]), code: z.string().length(6) });

export const orgSchema = z.object({ name: z.string().min(2), userLimit: z.number().int().min(1).max(100000), storageLimitBytes: z.number().int().min(1024) });

export const inviteSchema = z.object({ organizationId: z.string(), email: z.string().email().toLowerCase(), role: z.enum(["ORG_ADMIN", "USER"]) });
export const acceptInviteSchema = z.object({ token: z.string().min(32), name: z.string().min(2), password: z.string().min(8) });

export const domainSchema = z.object({ organizationId: z.string(), domain: z.string().min(3).regex(/^[a-zA-Z0-9.-]+$/) });

export const mailboxCreateSchema = z.object({
  domainId: z.string().min(1),
  username: z.string().min(1).regex(/^[a-zA-Z0-9._-]+$/),
  displayName: z.string().min(1),
  password: z.string().min(8).max(128),
  storageLimitBytes: z.number().int().min(1024).optional(),
});

export const mailboxPatchSchema = z.object({
  displayName: z.string().min(1).optional(),
  suspend: z.boolean().optional(),
  reactivate: z.boolean().optional(),
  resetPassword: z.string().min(8).max(128).optional(),
});

export const aliasCreateSchema = z.object({
  mailboxId: z.string().min(1),
  sourceAddress: z.string().email().toLowerCase(),
  destinationAddress: z.string().email().toLowerCase(),
  isEnabled: z.boolean().optional(),
});

export const aliasPatchSchema = z.object({
  isEnabled: z.boolean().optional(),
  destinationAddress: z.string().email().toLowerCase().optional(),
});

export const catchAllPatchSchema = z.object({
  catchAllEnabled: z.boolean(),
  catchAllMailboxId: z.string().nullable(),
});

export const emailSchema = z.object({
  mailbox: z.string().email(),
  from: z.string().email().optional(),
  to: z.array(z.string().email()).min(1),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  subject: z.string().min(1),
  bodyHtml: z.string().min(1),
  bodyText: z.string().min(1),
  attachments: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  sendAt: z.string().datetime().optional(),
  replyToEmailId: z.string().optional(),
});

export const inboundResendSchema = z.object({
  from: z.string().email(),
  to: z.array(z.string().email()).or(z.string().email().transform((v) => [v])),
  subject: z.string().default(""),
  text: z.string().default(""),
  html: z.string().default(""),
  headers: z.record(z.string(), z.string()).optional(),
});

export const inboundMailgunSchema = z.object({
  sender: z.string().email(),
  recipient: z.string().email(),
  subject: z.string().default(""),
  bodyPlain: z.string().default(""),
  bodyHtml: z.string().default(""),
  messageId: z.string().optional(),
});
