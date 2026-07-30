import "server-only";

import { headers } from "next/headers";

import { auth } from "@/server/auth/auth";

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}
