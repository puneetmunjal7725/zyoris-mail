import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { aliasPatchSchema } from "@/lib/validators";
import { Alias, Mailbox, ActivityLog } from "@/models";

async function assertAliasOrg(aliasId: string, organizationId: string) {
  const alias = await Alias.findById(aliasId);
  if (!alias) return { ok: false as const, res: NextResponse.json({ error: "Alias not found" }, { status: 404 }) };
  const mailbox = await Mailbox.findOne({ _id: alias.mailboxId, organizationId }).lean();
  if (!mailbox) return { ok: false as const, res: NextResponse.json({ error: "Alias not found" }, { status: 404 }) };
  return { ok: true as const, alias };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
  const { id } = await params;
  const parsed = aliasPatchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectToDatabase();
  const checked = await assertAliasOrg(id, String(session.user.organizationId));
  if (!checked.ok) return checked.res;

  if (typeof parsed.data.isEnabled === "boolean") checked.alias.isEnabled = parsed.data.isEnabled;
  if (typeof parsed.data.destinationAddress === "string") checked.alias.destinationAddress = parsed.data.destinationAddress;
  await checked.alias.save();

  await ActivityLog.create({
    organizationId: session.user.organizationId,
    userId: session.user.id,
    action: "ALIAS_UPDATED",
    metadata: { aliasId: checked.alias._id, source: checked.alias.sourceAddress },
  });

  return NextResponse.json(checked.alias);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
  const { id } = await params;
  await connectToDatabase();
  const checked = await assertAliasOrg(id, String(session.user.organizationId));
  if (!checked.ok) return checked.res;

  await Alias.deleteOne({ _id: checked.alias._id });

  await ActivityLog.create({
    organizationId: session.user.organizationId,
    userId: session.user.id,
    action: "ALIAS_DELETED",
    metadata: { aliasId: checked.alias._id, source: checked.alias.sourceAddress },
  });

  return NextResponse.json({ ok: true });
}

