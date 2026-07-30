import { NextResponse } from "next/server";

import { getMemberSessionFromRequest } from "@/server/auth/local/session";
import { jsonError } from "@/server/http/responses";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const session = await getMemberSessionFromRequest(request);

  if (!session) {
    return jsonError("Unauthorized", 401, "UNAUTHORIZED");
  }

  return NextResponse.json(
    {
      user: session.user,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
