import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ ok: true, service: "zyoris-mail", timestamp: new Date().toISOString() });
}
