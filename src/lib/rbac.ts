export type Role = "SUPER_ADMIN" | "ORG_ADMIN" | "USER";
export const hasRole = (current: Role, allowed: Role[]) => allowed.includes(current);
