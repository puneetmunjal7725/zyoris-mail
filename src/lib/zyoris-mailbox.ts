import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Domain, Mailbox } from "@/models";

const ZYORIS_DOMAIN = "zyoris.com";

export async function ensureZyorisDomain(organizationId: string) {
  let domain = await Domain.findOne({ organizationId, domain: ZYORIS_DOMAIN });
  if (!domain) {
    domain = await Domain.create({
      organizationId,
      domain: ZYORIS_DOMAIN,
      verificationToken: crypto.randomBytes(12).toString("hex"),
      status: "VERIFIED",
      dnsStatus: { txt: true, spf: true, dkim: true, dmarc: true, mx: true },
    });
  }
  return domain;
}

export async function createZyorisMailbox(
  organizationId: string,
  username: string,
  displayName: string
) {
  const normalized = username.toLowerCase().trim();
  const emailAddress = `${normalized}@${ZYORIS_DOMAIN}`;
  const taken = await Mailbox.findOne({ emailAddress });
  if (taken) throw new Error("This username is already taken");

  const domain = await ensureZyorisDomain(organizationId);
  const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 12);

  return Mailbox.create({
    organizationId,
    domainId: domain._id,
    emailAddress,
    username: normalized,
    displayName,
    passwordHash,
    storageLimitBytes: 1024 * 1024 * 1024,
    isActive: true,
    isSuspended: false,
  });
}
