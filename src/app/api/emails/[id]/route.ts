import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { withApi } from "@/lib/api-error";
import { Email } from "@/models";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApi(async () => {
    const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN", "USER"]);
    const { id } = await params;
    await connectToDatabase();
    const email = await Email.findOne({ _id: id, organizationId: session.user.organizationId }).lean();
    if (!email) return NextResponse.json({ error: "Email not found" }, { status: 404 });
    if (!email.isRead) {
      await Email.updateOne({ _id: id }, { $set: { isRead: true } });
      email.isRead = true;
    }
    const thread = email.threadId
      ? await Email.find({ threadId: email.threadId, organizationId: session.user.organizationId }).sort({ createdAt: 1 }).lean()
      : [email];
    return NextResponse.json({ email, thread });
  });
}
