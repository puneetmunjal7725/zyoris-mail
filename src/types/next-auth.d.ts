import NextAuth, { DefaultSession } from "next-auth";
declare module "next-auth" { interface Session { user: DefaultSession["user"] & { id: string; role: "SUPER_ADMIN" | "ORG_ADMIN" | "USER"; organizationId?: string | null; isVerified?: boolean; }; }}
declare module "next-auth/jwt" { interface JWT { role?: "SUPER_ADMIN" | "ORG_ADMIN" | "USER"; organizationId?: string | null; isVerified?: boolean; }}
