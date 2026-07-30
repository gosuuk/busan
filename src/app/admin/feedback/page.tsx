import { desc, inArray } from "drizzle-orm";
import type { Metadata } from "next";

import { AdminFeedbackBoard } from "@/features/admin/components/admin-feedback-board";
import { db } from "@/server/db";
import {
  communityFeedback,
  communityFeedbackComments,
} from "@/server/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리자 제안·버그",
};

export default async function AdminFeedbackPage() {
  const feedbackRows = await db
    .select({
      id: communityFeedback.id,
      type: communityFeedback.type,
      title: communityFeedback.title,
      description: communityFeedback.description,
      status: communityFeedback.status,
      authorName: communityFeedback.authorName,
      createdAt: communityFeedback.createdAt,
    })
    .from(communityFeedback)
    .orderBy(desc(communityFeedback.createdAt))
    .limit(100);

  const feedbackIds = feedbackRows.map((feedback) => feedback.id);
  const commentRows =
    feedbackIds.length > 0
      ? await db
          .select({
            id: communityFeedbackComments.id,
            feedbackId: communityFeedbackComments.feedbackId,
            authorName: communityFeedbackComments.authorName,
            body: communityFeedbackComments.body,
            previousStatus: communityFeedbackComments.previousStatus,
            nextStatus: communityFeedbackComments.nextStatus,
            createdAt: communityFeedbackComments.createdAt,
          })
          .from(communityFeedbackComments)
          .where(inArray(communityFeedbackComments.feedbackId, feedbackIds))
          .orderBy(desc(communityFeedbackComments.createdAt))
      : [];

  return (
    <AdminFeedbackBoard
      feedbackItems={feedbackRows.map((feedback) => ({
        ...feedback,
        createdAt: feedback.createdAt.toISOString(),
        comments: commentRows
          .filter((comment) => comment.feedbackId === feedback.id)
          .map((comment) => ({
            id: comment.id,
            authorName: comment.authorName,
            body: comment.body,
            previousStatus: comment.previousStatus ?? null,
            nextStatus: comment.nextStatus ?? null,
            createdAt: comment.createdAt.toISOString(),
          })),
      }))}
    />
  );
}
