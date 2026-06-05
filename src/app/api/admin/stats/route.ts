import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, Organization, Domain, Email, ActivityLog, Mailbox } from "@/models";

export async function GET() {
  await connectToDatabase();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [users, organizations, domains, emails, activities, mailboxes, activeMailboxes, mailboxGrowth7d, storageUsedBytes] =
    await Promise.all([
      User.countDocuments(),
      Organization.countDocuments(),
      Domain.countDocuments(),
      Email.countDocuments(),
      ActivityLog.countDocuments(),
      Mailbox.countDocuments(),
      Mailbox.countDocuments({ isActive: true, isSuspended: { $ne: true } }),
      Mailbox.countDocuments({ createdAt: { $gte: since7d } }),
      Organization.aggregate([{ $group: { _id: null, total: { $sum: "$storageUsedBytes" } } }]),
    ]);
  const totalStorage = Array.isArray(storageUsedBytes) && storageUsedBytes[0]?.total ? Number(storageUsedBytes[0].total) : 0;
  return NextResponse.json({
    users,
    organizations,
    domains,
    emails,
    activities,
    mailboxes,
    activeMailboxes,
    mailboxGrowth7d,
    storageUsedBytes: totalStorage,
  });
}
