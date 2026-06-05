import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { signedDownloadUrl, deleteObject } from "@/lib/services/storage";
import { Attachment, Organization } from "@/models";

export async function GET(_: Request, { params }: { params: Promise<{ attachmentId: string }> }) {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN", "USER"]);
  const { attachmentId } = await params;
  await connectToDatabase();
  const attachment = await Attachment.findOne({ _id: attachmentId, organizationId: session.user.organizationId });
  if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const url = await signedDownloadUrl(attachment.storageKey);
  return NextResponse.json({ url, attachment });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ attachmentId: string }> }) {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN", "USER"]);
  const { attachmentId } = await params;
  await connectToDatabase();
  const attachment = await Attachment.findOne({ _id: attachmentId, organizationId: session.user.organizationId });
  if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteObject(attachment.storageKey);
  await Organization.findByIdAndUpdate(session.user.organizationId, { $inc: { storageUsedBytes: -attachment.size } });
  await attachment.deleteOne();
  return NextResponse.json({ ok: true });
}
