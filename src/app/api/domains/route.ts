import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { domainSchema } from "@/lib/validators";
import { Domain, ActivityLog } from "@/models";

export async function GET() {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN", "USER"]);
  await connectToDatabase();
  const rows = await Domain.find({ organizationId: session.user.organizationId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
  const parsed = domainSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectToDatabase();
  const token = crypto.randomBytes(12).toString("hex");

  const domain = await Domain.create({
    organizationId: parsed.data.organizationId,
    domain: parsed.data.domain.toLowerCase(),
    verificationToken: token,
    status: "PENDING",
  });

  await ActivityLog.create({ organizationId: parsed.data.organizationId, userId: session.user.id, action: "DOMAIN_ADDED", metadata: { domain: domain.domain } });

  return NextResponse.json({
    ...domain.toObject(),
    verificationInstructions: {
      txt: `Add TXT record on root domain: zyoris-verification=${token}`,
      dkim: `Add TXT record on zyoris._domainkey.${domain.domain}`,
      dmarc: `Add TXT on _dmarc.${domain.domain} with v=DMARC1; p=none`,
      mx: `Add MX records from your provider`,
    },
  }, { status: 201 });
}
