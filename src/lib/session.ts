import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasRole, type Role } from "@/lib/rbac";
import { forbidden, unauthorized } from "@/lib/api-error";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw unauthorized();
  return session;
}

export async function requireRole(roles: Role[]) {
  const session = await requireSession();
  if (!hasRole(session.user.role, roles)) throw forbidden();
  return session;
}
