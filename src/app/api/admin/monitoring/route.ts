import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { ActivityLog, User, Organization, Email, Domain } from "@/models";

export async function GET() {
  await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
  await connectToDatabase();

  const [users, organizations, emails, verifiedDomains, failedDomains, recentSecurityEvents] = await Promise.all([
    User.countDocuments(),
    Organization.countDocuments(),
    Email.countDocuments(),
    Domain.countDocuments({ status: "VERIFIED" }),
    Domain.countDocuments({ status: "FAILED" }),
    ActivityLog.find({ severity: "HIGH" }).sort({ createdAt: -1 }).limit(20).lean(),
  ]);

  return NextResponse.json({ users, organizations, emails, verifiedDomains, failedDomains, recentSecurityEvents });
}
