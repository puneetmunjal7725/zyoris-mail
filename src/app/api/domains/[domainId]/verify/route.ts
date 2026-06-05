import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { verifyDomainDns } from "@/lib/services/dns-verification";
import { Domain, ActivityLog } from "@/models";

export async function POST(_: Request, { params }: { params: Promise<{ domainId: string }> }) {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
  const { domainId } = await params;

  await connectToDatabase();
  const domain = await Domain.findOne({ _id: domainId, organizationId: session.user.organizationId });
  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 });

  const result = await verifyDomainDns(domain.domain, domain.verificationToken);

  domain.dnsStatus = {
    txt: result.txt.ok,
    spf: result.spf.ok,
    dkim: result.dkim.ok,
    dmarc: result.dmarc.ok,
    mx: result.mx.ok,
  };
  domain.diagnostics = {
    txt: result.txt.message,
    spf: result.spf.message,
    dkim: result.dkim.message,
    dmarc: result.dmarc.message,
    mx: result.mx.message,
  };
  domain.status = result.isVerified ? "VERIFIED" : "FAILED";
  domain.lastCheckedAt = new Date();
  await domain.save();

  await ActivityLog.create({ organizationId: domain.organizationId, userId: session.user.id, action: "DOMAIN_VERIFIED", metadata: { domain: domain.domain, status: domain.status } });

  return NextResponse.json(domain);
}
