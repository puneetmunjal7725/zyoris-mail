import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { applyPlanToOrgFields } from "@/lib/plan-limits";
import { User, Organization, Domain, Settings, ActivityLog } from "@/models";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const secret = String(body.secret || "");
  const expected = process.env.SETUP_SECRET || process.env.SUPER_ADMIN_PASSWORD;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();

  const adminEmail = (process.env.SUPER_ADMIN_EMAIL || "admin@zyoris.com").toLowerCase();
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "ZyorisAdmin2026!";
  const adminName = process.env.SUPER_ADMIN_NAME || "Zyoris Super Admin";

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: adminName,
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "SUPER_ADMIN",
      isVerified: true,
    });
  }

  let platformOrg = await Organization.findOne({ slug: "zyoris-platform" });
  if (!platformOrg) {
    platformOrg = await Organization.create({
      name: "Zyoris Platform",
      slug: "zyoris-platform",
      ownerId: admin._id,
      isPlatform: true,
      ...applyPlanToOrgFields("enterprise"),
    });
    admin.organizationId = platformOrg._id;
    await admin.save();
    await Settings.create({ organizationId: platformOrg._id });
  }

  let zyorisDomain = await Domain.findOne({ domain: "zyoris.com" });
  if (!zyorisDomain) {
    zyorisDomain = await Domain.create({
      organizationId: platformOrg._id,
      domain: "zyoris.com",
      verificationToken: crypto.randomBytes(12).toString("hex"),
      status: "VERIFIED",
      dnsStatus: { txt: true, spf: true, dkim: true, dmarc: true, mx: true },
      diagnostics: {
        txt: "zyoris-platform-verified",
        spf: "v=spf1 include:resend.com ~all",
        dkim: "Configure in Resend dashboard",
        dmarc: "v=DMARC1; p=none",
        mx: "Configure MX for inbound",
      },
      lastCheckedAt: new Date(),
    });
  }

  await ActivityLog.create({
    organizationId: platformOrg._id,
    userId: admin._id,
    action: "PLATFORM_BOOTSTRAP",
    severity: "HIGH",
  });

  return NextResponse.json({
    ok: true,
    adminEmail,
    platformOrgId: String(platformOrg._id),
    zyorisDomain: zyorisDomain.domain,
    zyorisDomainStatus: zyorisDomain.status,
  });
}
