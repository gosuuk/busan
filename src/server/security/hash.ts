import "server-only";

import { createHmac } from "node:crypto";

import { environment } from "@/config/environment";

export function createAnalyticsHash(value: string): string {
  if (!environment.ANALYTICS_HASH_SECRET) {
    throw new Error("ANALYTICS_HASH_SECRET is required for analytics hashing.");
  }

  return createHmac("sha256", environment.ANALYTICS_HASH_SECRET)
    .update(value)
    .digest("hex");
}
