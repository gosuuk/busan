import { NextResponse } from "next/server";

export function jsonError(
  message: string,
  status: number,
  code = "REQUEST_ERROR",
  details?: unknown,
): NextResponse {
  return NextResponse.json(
    details === undefined
      ? {
          code,
          message,
        }
      : {
          code,
          message,
          details,
        },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
