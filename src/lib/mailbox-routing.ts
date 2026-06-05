import mongoose from "mongoose";
import { Alias, Domain, Mailbox } from "@/models";

export type ResolvedRecipient =
  | { ok: true; mailbox: any; address: string; resolution: "DIRECT" | "ALIAS" | "CATCH_ALL" }
  | { ok: false; status: 404 | 403 | 429; error: string };

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function estimateEmailBytes(input: { subject: string; bodyText: string; bodyHtml: string }) {
  const s = `${input.subject}\n${input.bodyText}\n${input.bodyHtml}`;
  return Buffer.byteLength(s, "utf8");
}

export async function resolveInboundRecipient(recipient: string): Promise<ResolvedRecipient> {
  const address = normalizeEmail(recipient);
  const [_, domainPart] = address.split("@");
  if (!domainPart) return { ok: false, status: 404, error: "Invalid recipient" };

  const domainRow = await Domain.findOne({ domain: domainPart, status: "VERIFIED" }).lean();
  if (!domainRow) return { ok: false, status: 404, error: "Recipient domain not configured" };

  const direct = await Mailbox.findOne({ emailAddress: address, organizationId: domainRow.organizationId }).lean();
  if (direct) {
    if (!direct.isActive || direct.isSuspended) return { ok: false, status: 403, error: "Mailbox suspended" };
    return { ok: true, mailbox: direct, address, resolution: "DIRECT" };
  }

  const alias = await Alias.findOne({ sourceAddress: address, isEnabled: true }).lean();
  if (alias) {
    const destAddress = normalizeEmail(alias.destinationAddress);
    const dest = await Mailbox.findOne({ emailAddress: destAddress, organizationId: domainRow.organizationId }).lean();
    if (dest) {
      if (!dest.isActive || dest.isSuspended) return { ok: false, status: 403, error: "Mailbox suspended" };
      return { ok: true, mailbox: dest, address: destAddress, resolution: "ALIAS" };
    }
  }

  if (domainRow.catchAllEnabled && domainRow.catchAllMailboxId) {
    const dest = await Mailbox.findOne({ _id: new mongoose.Types.ObjectId(String(domainRow.catchAllMailboxId)), organizationId: domainRow.organizationId }).lean();
    if (dest) {
      if (!dest.isActive || dest.isSuspended) return { ok: false, status: 403, error: "Mailbox suspended" };
      return { ok: true, mailbox: dest, address: String(dest.emailAddress), resolution: "CATCH_ALL" };
    }
  }

  return { ok: false, status: 404, error: "Unknown recipient" };
}

export function checkMailboxQuota(mailbox: { storageUsedBytes?: number; storageLimitBytes?: number }, incomingBytes: number) {
  const used = Number(mailbox.storageUsedBytes || 0);
  const limit = Number(mailbox.storageLimitBytes || 0);
  if (limit > 0 && used + incomingBytes > limit) return { allowed: false };
  return { allowed: true };
}

