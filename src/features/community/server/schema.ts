import { z } from "zod";

import {
  communityFeedbackStatuses,
  communityFeedbackTypes,
} from "@/server/db/schema";

export const createCommunityFeedbackSchema = z.object({
  type: z.enum([communityFeedbackTypes.FEATURE, communityFeedbackTypes.BUG]),
  title: z
    .string()
    .trim()
    .min(4, "제목은 4자 이상 입력해주세요.")
    .max(140, "제목은 140자 이하로 입력해주세요."),
  description: z
    .string()
    .trim()
    .min(10, "내용은 10자 이상 입력해주세요.")
    .max(2000, "내용은 2000자 이하로 입력해주세요."),
});

export type CreateCommunityFeedbackInput = z.infer<
  typeof createCommunityFeedbackSchema
>;

export const updateCommunityFeedbackStatusSchema = z.object({
  status: z.enum([
    communityFeedbackStatuses.OPEN,
    communityFeedbackStatuses.REVIEWING,
    communityFeedbackStatuses.PLANNED,
    communityFeedbackStatuses.DONE,
    communityFeedbackStatuses.CLOSED,
  ]),
  comment: z.string().trim().max(1000).optional(),
});

export const createCommunityFeedbackCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "댓글 내용을 입력해주세요.")
    .max(1000, "댓글은 1000자 이하로 입력해주세요."),
});
