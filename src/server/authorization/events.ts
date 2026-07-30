import { memberRoles, type AuthorizationContext } from "./roles";

export interface ResourceOwnership {
  ownerId: string;
}

export function canManageEvent(
  context: AuthorizationContext,
  resource: ResourceOwnership,
): boolean {
  if (context.role === memberRoles.ADMIN) return true;
  if (context.role === memberRoles.MODERATOR) return true;

  return (
    context.role === memberRoles.ORGANIZER &&
    context.userId === resource.ownerId
  );
}
