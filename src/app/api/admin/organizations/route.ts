import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Organization, User, Domain, Mailbox, ActivityLog } from "@/models";

const limitsSchema = z.object({
  organizationId: z.string(),
  plan: z.enum(["free", "growth", "business", "enterprise"]).optional(),
  userLimit: z.number().int().optional(),
  mailboxLimit: z.number().int().optional(),
  domainLimit: z.number().int().optional(),
  aliasLimit: z.number().int().optional(),
  storageLimitBytes: z.number().int().optional(),
  emailsPerDayLimit: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  await requireRole(["SUPER_ADMIN"]);
  await connectToDatabase();
  const orgs = await Organization.find().sort({ createdAt: -1 }).lean();
  const enriched = await Promise.all(
    orgs.map(async (org) => {
      const [users, domains, mailboxes] = await Promise.all([
        User.countDocuments({ organizationId: org._id }),
        Domain.countDocuments({ organizationId: org._id }),
        Mailbox.countDocuments({ organizationId: org._id }),
      ]);
      return { ...org, usage: { users, domains, mailboxes, storageUsedBytes: org.storageUsedBytes } };
    })
  );
  return NextResponse.json(enriched);
}

export async function PATCH(req: Request) {
  const session = await requireRole(["SUPER_ADMIN"]);
  const parsed = limitsSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectToDatabase();
  const { organizationId, ...updates } = parsed.data;
  const org = await Organization.findByIdAndUpdate(organizationId, updates, { new: true });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  await ActivityLog.create({
    organizationId: org._id,
    userId: session.user.id,
    action: "ADMIN_ORG_LIMITS_UPDATED",
    severity: "HIGH",
    metadata: updates,
  });

  return NextResponse.json(org);
}
