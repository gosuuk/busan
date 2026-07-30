import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createCommunityFeedbackCommentSchema } from "@/features/community/server/schema";
import {
  recordAdminAuditLog,
  requireAdminApiSession,
} from "@/server/auth/local/admin-security";
import { db } from "@/server/db";
import {
  communityFeedback,
  communityFeedbackComments,
} from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { recordApplicationLog } from "@/server/logging/application-log";
import {
  readJsonBody,
  RequestValidationError,
} from "@/server/security/request";

export const runtime = "nodejs";

interface AdminFeedbackCommentRouteProps {
  params: Promise<{
    feedbackId: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: AdminFeedbackCommentRouteProps,
): Promise<Response> {
  const sessionResult = await requireAdminApiSession({
    request,
    route: "/api/admin/community-feedback/comments",
  });

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  const { feedbackId } = await params;

  try {
    const body = await readJsonBody(request, {
      maxBytes: 4_000,
    });
    const parsed = createCommunityFeedbackCommentSchema.parse(body);
    const [feedback] = await db
      .select({
        id: communityFeedback.id,
        title: communityFeedback.title,
      })
      .from(communityFeedback)
      .where(eq(communityFeedback.id, feedbackId))
      .limit(1);

    if (!feedback) {
      return jsonError("Feedback not found", 404, "FEEDBACK_NOT_FOUND");
    }

    const [comment] = await db
      .insert(communityFeedbackComments)
      .values({
        feedbackId,
        authorUserId: sessionResult.session.user.id,
        authorName:
          sessionResult.session.user.nickname ?? sessionResult.session.user.name,
        body: parsed.body,
      })
      .returning();

    await recordAdminAuditLog({
      action: "admin_community_feedback_commented",
      actorRole: sessionResult.session.user.role,
      actorUserId: sessionResult.session.user.id,
      targetType: "community_feedback",
      targetId: feedbackId,
      metadata: {
        title: feedback.title,
      },
    });

    await recordApplicationLog({
      level: "info",
      message: "community feedback comment created",
      route: "/api/admin/community-feedback/comments",
      method: "POST",
      status: "201",
      userId: sessionResult.session.user.id,
      metadata: {
        feedbackId,
        commentId: comment.id,
      },
    });

    return NextResponse.json(
      {
        comment,
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
      return jsonError("Invalid feedback comment payload", 400, "INVALID_BODY");
    }

    return jsonError("Unable to create feedback comment", 500, "FEEDBACK_COMMENT_FAILED");
  }
}
