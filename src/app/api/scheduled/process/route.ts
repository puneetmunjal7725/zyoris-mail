import { NextResponse } from "next/server";
import { getMailQueue } from "@/lib/queue/mail-queue";

export async function POST(req: Request) {
  const body = (await req.json()) as { scheduledEmailId: string; delayMs?: number };
  if (!body.scheduledEmailId) return NextResponse.json({ error: "scheduledEmailId required" }, { status: 400 });
  await getMailQueue().add("send-scheduled-email", { scheduledEmailId: body.scheduledEmailId }, { delay: Math.max(0, body.delayMs || 0) });
  return NextResponse.json({ ok: true });
}
