import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createCommunityFeedbackSchema } from "@/features/community/server/schema";
import { getMemberSessionFromRequest } from "@/server/auth/local/session";
import { db } from "@/server/db";
import { communityFeedback } from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { recordApplicationLog } from "@/server/logging/application-log";
import { checkRateLimit } from "@/server/security/rate-limit";
import {
  readJsonBody,
  RequestValidationError,
} from "@/server/security/request";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const session = await getMemberSessionFromRequest(request);

  if (!session) {
    return jsonError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const rateLimit = checkRateLimit(`community-feedback:${session.user.id}`, {
    limit: 5,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return jsonError("Too many requests", 429, "RATE_LIMITED");
  }

  try {
    const body = await readJsonBody(request, {
      maxBytes: 8_000,
    });
    const parsed = createCommunityFeedbackSchema.parse(body);
    const [feedback] = await db
      .insert(communityFeedback)
      .values({
        type: parsed.type,
        title: parsed.title,
        description: parsed.description,
        authorUserId: session.user.id,
        authorName: session.user.nickname ?? session.user.name,
      })
      .returning();

    await recordApplicationLog({
      level: "info",
      message: "community feedback created",
      route: "/api/community/feedback",
      method: "POST",
      status: "201",
      userId: session.user.id,
      metadata: {
        feedbackId: feedback.id,
        type: feedback.type,
      },
    });

    return NextResponse.json(
      {
        feedback,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return jsonError(error.message, error.status, error.code);
    }

    if (error instanceof ZodError) {
      return jsonError(
        "제안 입력값을 다시 확인해주세요.",
        400,
        "INVALID_BODY",
        error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      );
    }

    await recordApplicationLog({
      level: "error",
      message: "community feedback creation failed",
      route: "/api/community/feedback",
      method: "POST",
      status: "500",
      userId: session.user.id,
    });

    return jsonError("Unable to create feedback", 500, "FEEDBACK_CREATE_FAILED");
  }
}
