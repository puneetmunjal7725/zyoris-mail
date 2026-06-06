import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectToDatabase();
        const email = credentials.email.toLowerCase().trim();
        const user = await User.findOne({ email });
        if (!user) return null;

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("Account temporarily locked");
        }

        if (!user.isVerified && user.role !== "SUPER_ADMIN") {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
          if (user.failedLoginAttempts >= 5) {
            user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
            user.failedLoginAttempts = 0;
          }
          await user.save();
          return null;
        }

        user.failedLoginAttempts = 0;
        user.lockedUntil = undefined;
        user.lastLoginAt = new Date();
        await user.save();

        return {
          id: String(user._id),
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId ? String(user.organizationId) : null,
          isVerified: user.isVerified,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.organizationId = (user as any).organizationId;
        token.isVerified = (user as any).isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = token.sub;
      (session.user as any).role = token.role;
      (session.user as any).organizationId = token.organizationId;
      (session.user as any).isVerified = token.isVerified;
      return session;
    },
  },
};
