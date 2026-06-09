import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { domainSchema } from "@/lib/validators";
import { Domain, ActivityLog, Organization } from "@/models";
import { isWithinLimit } from "@/lib/plan-limits";
import { domainValidationMessage, normalizeDomain } from "@/lib/domain-utils";

function verificationInstructions(domain: string, token: string) {
  return {
    txt: { host: "@", value: `zyoris-verification=${token}` },
    spf: { host: "@", value: "v=spf1 include:resend.com ~all" },
    dkim: { host: "zyoris._domainkey", value: "Add DKIM record from Resend dashboard" },
    dmarc: { host: "_dmarc", value: "v=DMARC1; p=none; rua=mailto:dmarc@" + domain },
    mx: { host: "@", value: "Add MX records from your email provider" },
  };
}

export async function GET() {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN", "USER"]);
  await connectToDatabase();
  const rows = await Domain.find({ organizationId: session.user.organizationId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
    const body = await req.json().catch(() => null);
    const parsed = domainSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors.domain;
      const message = fieldErrors?.[0] || "Please enter a valid domain";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    await connectToDatabase();

    const orgId = parsed.data.organizationId;
    if (orgId !== String(session.user.organizationId) && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const org = await Organization.findById(orgId).lean();
    if (!org || org.isActive === false) {
      return NextResponse.json({ error: "Organization not active" }, { status: 403 });
    }

    const domainName = parsed.data.domain;
    const clientMessage = domainValidationMessage(domainName);
    if (clientMessage) {
      return NextResponse.json({ error: clientMessage }, { status: 400 });
    }

    const existingInOrg = await Domain.findOne({ organizationId: orgId, domain: domainName }).lean();
    if (existingInOrg) {
      return NextResponse.json({ error: "This domain is already connected" }, { status: 409 });
    }

    const takenGlobally = await Domain.findOne({
      domain: domainName,
      organizationId: { $ne: orgId },
      status: { $in: ["PENDING", "VERIFIED"] },
    }).lean();
    if (takenGlobally) {
      return NextResponse.json({ error: "This domain is already connected to another organization" }, { status: 409 });
    }

    const domainCount = await Domain.countDocuments({
      organizationId: orgId,
      domain: { $ne: "zyoris.com" },
    });
    if (!isWithinLimit(domainCount, org.domainLimit)) {
      return NextResponse.json({ error: "You have reached your domain limit" }, { status: 403 });
    }

    const token = crypto.randomBytes(12).toString("hex");

    const domain = await Domain.create({
      organizationId: orgId,
      domain: domainName,
      verificationToken: token,
      status: "PENDING",
    });

    await ActivityLog.create({
      organizationId: orgId,
      userId: session.user.id,
      action: "DOMAIN_ADDED",
      metadata: { domain: domain.domain },
    });

    return NextResponse.json(
      {
        ...domain.toObject(),
        verificationInstructions: verificationInstructions(domain.domain, token),
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
      return NextResponse.json({ error: "This domain is already connected" }, { status: 409 });
    }
    console.error("Domain create failed:", err);
    return NextResponse.json({ error: "Failed to add domain. Please try again." }, { status: 500 });
  }
}
