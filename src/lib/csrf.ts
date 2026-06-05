import { NextRequest, NextResponse } from "next/server";

export function enforceCsrf(req: NextRequest) {
  const csrfCookie = req.cookies.get("csrf-token")?.value;
  const csrfHeader = req.headers.get("x-csrf-token");
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }
  return null;
}
