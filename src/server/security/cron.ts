import "server-only";

import { environment } from "@/config/environment";

export function isAuthorizedCronRequest(request: Request): boolean {
  if (!environment.CRON_SECRET) return false;

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${environment.CRON_SECRET}`;
}
