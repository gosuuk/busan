export const memberRoles = {
  MEMBER: "member",
  ORGANIZER: "organizer",
  MODERATOR: "moderator",
  ADMIN: "admin",
} as const;

export type MemberRole = (typeof memberRoles)[keyof typeof memberRoles];

export interface AuthorizationContext {
  userId: string;
  role: MemberRole;
}

export function hasAnyRole(
  context: AuthorizationContext,
  allowedRoles: readonly MemberRole[],
): boolean {
  return allowedRoles.includes(context.role);
}

export function assertAnyRole(
  context: AuthorizationContext,
  allowedRoles: readonly MemberRole[],
): void {
  if (!hasAnyRole(context, allowedRoles)) {
    throw new Error("FORBIDDEN");
  }
}
