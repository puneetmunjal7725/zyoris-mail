import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { withApi } from "@/lib/api-error";
import { Email } from "@/models";
import { z } from "zod";

const bulkSchema = z.object({
  emailIds: z.array(z.string()).min(1),
  action: z.enum(["DELETE", "RESTORE", "MARK_READ", "MARK_UNREAD", "STAR", "UNSTAR", "SPAM", "ARCHIVE"]),
});

export async function PATCH(req: Request) {
  return withApi(async () => {
    const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN", "USER"]);
    const parsed = bulkSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    await connectToDatabase();

    const update: Record<string, unknown> = {};
    switch (parsed.data.action) {
      case "DELETE":
        update.isDeleted = true;
        update.folder = "TRASH";
        break;
      case "RESTORE":
        update.isDeleted = false;
        update.folder = "INBOX";
        break;
      case "MARK_READ":
        update.isRead = true;
        break;
      case "MARK_UNREAD":
        update.isRead = false;
        break;
      case "STAR":
        update.isStarred = true;
        break;
      case "UNSTAR":
        update.isStarred = false;
        break;
      case "SPAM":
        update.folder = "SPAM";
        break;
      case "ARCHIVE":
        update.folder = "ARCHIVE";
        break;
    }

    const result = await Email.updateMany(
      { _id: { $in: parsed.data.emailIds }, organizationId: session.user.organizationId },
      { $set: update }
    );

    return NextResponse.json({ modified: result.modifiedCount });
  });
}
