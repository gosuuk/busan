import "server-only";

import { environment } from "@/config/environment";
import { localUserRoles, type LocalUserRole } from "@/server/db/schema";

export function resolveSignupRole(email: string): LocalUserRole {
  if (environment.VERCEL_ENV === "production") {
    return localUserRoles.MEMBER;
  }

  const adminEmails = environment.LOCAL_ADMIN_EMAILS.split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(email.toLowerCase())
    ? localUserRoles.ADMIN
    : localUserRoles.MEMBER;
}
