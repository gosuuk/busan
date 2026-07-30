import { NextResponse } from "next/server";

import { clearAuthCookies } from "@/server/auth/local/session";

export const runtime = "nodejs";

export function POST(): Response {
  const response = new NextResponse(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
    },
  });

  clearAuthCookies(response);

  return response;
}
