import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { sha256 } from "@/lib/env";

export async function POST(req: Request) {
  const body = (await req.json()) as { email: string; token: string };
  if (!body.email || !body.token) return NextResponse.json({ error: "email and token required" }, { status: 400 });

  await connectToDatabase();
  const user = await User.findOne({ email: body.email.toLowerCase() });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (sha256(body.email) !== body.token) return NextResponse.json({ error: "Invalid verification token" }, { status: 400 });

  user.isVerified = true;
  user.emailVerifiedAt = new Date();
  await user.save();

  return NextResponse.json({ ok: true });
}
