import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { updateCommunityFeedbackStatusSchema } from "@/features/community/server/schema";
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

interface AdminFeedbackStatusRouteProps {
  params: Promise<{
    feedbackId: string;
  }>;
}

const statusLabels: Record<string, string> = {
  open: "open",
  reviewing: "진행 중",
  planned: "예정",
  done: "완료",
  closed: "닫힘",
};

export async function PATCH(
  request: Request,
  { params }: AdminFeedbackStatusRouteProps,
): Promise<Response> {
  const sessionResult = await requireAdminApiSession({
    request,
    route: "/api/admin/community-feedback/status",
  });

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  const { feedbackId } = await params;

  try {
    const body = await readJsonBody(request, {
      maxBytes: 4_000,
    });
    const parsed = updateCommunityFeedbackStatusSchema.parse(body);
    const [currentFeedback] = await db
      .select({
        id: communityFeedback.id,
        title: communityFeedback.title,
        status: communityFeedback.status,
      })
      .from(communityFeedback)
      .where(eq(communityFeedback.id, feedbackId))
      .limit(1);

    if (!currentFeedback) {
      return jsonError("Feedback not found", 404, "FEEDBACK_NOT_FOUND");
    }

    const now = new Date();
    const [updatedFeedback] = await db
      .update(communityFeedback)
      .set({
        status: parsed.status,
        updatedAt: now,
      })
      .where(eq(communityFeedback.id, feedbackId))
      .returning();

    const commentBody =
      parsed.comment?.trim() ||
      `상태를 ${statusLabels[currentFeedback.status] ?? currentFeedback.status}에서 ${
        statusLabels[parsed.status] ?? parsed.status
      }로 변경했습니다.`;

    await db.insert(communityFeedbackComments).values({
      feedbackId,
      authorUserId: sessionResult.session.user.id,
      authorName:
        sessionResult.session.user.nickname ?? sessionResult.session.user.name,
      body: commentBody,
      previousStatus: currentFeedback.status,
      nextStatus: parsed.status,
      createdAt: now,
    });

    await recordAdminAuditLog({
      action: "admin_community_feedback_status_updated",
      actorRole: sessionResult.session.user.role,
      actorUserId: sessionResult.session.user.id,
      targetType: "community_feedback",
      targetId: feedbackId,
      metadata: {
        previousStatus: currentFeedback.status,
        nextStatus: parsed.status,
        title: currentFeedback.title,
      },
    });

    await recordApplicationLog({
      level: "info",
      message: "community feedback status updated",
      route: "/api/admin/community-feedback/status",
      method: "PATCH",
      status: "200",
      userId: sessionResult.session.user.id,
      metadata: {
        feedbackId,
        nextStatus: parsed.status,
      },
    });

    return NextResponse.json(
      {
        feedback: updatedFeedback,
      },
      {
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
      return jsonError("Invalid feedback status payload", 400, "INVALID_BODY");
    }

    return jsonError("Unable to update feedback status", 500, "FEEDBACK_STATUS_FAILED");
  }
}
