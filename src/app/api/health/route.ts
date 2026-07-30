import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET(): Response {
  return NextResponse.json(
    {
      service: "busan-it-community",
      status: "ok",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
