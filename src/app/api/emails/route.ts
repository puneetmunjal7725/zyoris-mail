import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { withApi } from "@/lib/api-error";
import { Email } from "@/models";

export async function GET(req: Request) {
  return withApi(async () => {
    const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN", "USER"]);
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "INBOX";
    const q = searchParams.get("q") || "";
    const mailbox = searchParams.get("mailbox") || "";
    const label = searchParams.get("label") || "";

    const filter: Record<string, unknown> = {
      organizationId: session.user.organizationId,
    };

    if (folder === "STARRED") {
      filter.isStarred = true;
      filter.isDeleted = { $ne: true };
    } else if (folder === "TRASH") {
      filter.isDeleted = true;
    } else {
      filter.folder = folder;
      filter.isDeleted = { $ne: true };
    }

    if (mailbox) filter.mailbox = mailbox.toLowerCase();
    if (label) filter.labels = label;
    if (q.trim()) filter.$text = { $search: q };

    const rows = await Email.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json(rows);
  });
}

export async function PATCH(req: Request) {
  return withApi(async () => {
    const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN", "USER"]);
    await connectToDatabase();
    const body = (await req.json()) as {
      emailId: string;
      action: "STAR" | "UNSTAR" | "DELETE" | "RESTORE" | "ARCHIVE" | "MARK_READ" | "MARK_UNREAD" | "SPAM" | "ADD_LABEL" | "REMOVE_LABEL";
      label?: string;
    };
    const email = await Email.findOne({ _id: body.emailId, organizationId: session.user.organizationId });
    if (!email) return NextResponse.json({ error: "Email not found" }, { status: 404 });

    switch (body.action) {
      case "STAR":
        email.isStarred = true;
        break;
      case "UNSTAR":
        email.isStarred = false;
        break;
      case "DELETE":
        email.isDeleted = true;
        email.folder = "TRASH";
        break;
      case "RESTORE":
        email.isDeleted = false;
        email.folder = "INBOX";
        break;
      case "ARCHIVE":
        email.folder = "ARCHIVE";
        break;
      case "MARK_READ":
        email.isRead = true;
        break;
      case "MARK_UNREAD":
        email.isRead = false;
        break;
      case "SPAM":
        email.folder = "SPAM";
        break;
      case "ADD_LABEL":
        if (body.label && !email.labels.includes(body.label)) email.labels.push(body.label);
        break;
      case "REMOVE_LABEL":
        if (body.label) email.labels = email.labels.filter((l: string) => l !== body.label);
        break;
    }

    await email.save();
    return NextResponse.json(email);
  });
}
