import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const protectedApiPrefixes = [
  "/api/organizations",
  "/api/domains",
  "/api/emails",
  "/api/invitations",
  "/api/attachments",
  "/api/admin",
  "/api/mailboxes",
  "/api/aliases",
  "/api/users",
  "/api/billing",
];

const csrfExempt = [
  "/api/auth",
  "/api/emails/inbound",
  "/api/health",
  "/api/invitations/accept",
];

function ensureCsrfCookie(res: NextResponse) {
  const existing = res.cookies.get("csrf-token")?.value;
  if (!existing) {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    res.cookies.set("csrf-token", token, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
}

export default withAuth(
  function middleware(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const key = `${ip}:${req.nextUrl.pathname}`;
    const { allowed } = rateLimit(key, 200, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const method = req.method.toUpperCase();
    const path = req.nextUrl.pathname;

    if (method !== "GET" && method !== "HEAD" && path.startsWith("/api")) {
      const exempt = csrfExempt.some((p) => path.startsWith(p));
      if (!exempt) {
        const csrfCookie = req.cookies.get("csrf-token")?.value;
        const csrfHeader = req.headers.get("x-csrf-token");
        if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
          return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
        }
      }
    }

    const res = NextResponse.next();
    ensureCsrfCookie(res);
    return res;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith("/app")) return !!token;
        if (protectedApiPrefixes.some((p) => path.startsWith(p))) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/app/:path*", "/api/:path*"],
};
