import { z } from "zod";

import { isHttpUrl } from "@/lib/url";

export const experienceRanges = {
  BEGINNER: "beginner",
  ONE_TO_THREE: "1-3",
  FOUR_TO_SIX: "4-6",
  SEVEN_PLUS: "7+",
} as const;

const optionalHttpUrl = z
  .string()
  .max(300)
  .refine(isHttpUrl, "Only http and https URLs are allowed.")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const communityProfileSchema = z.object({
  nickname: z.string().trim().min(2).max(30),
  introduction: z.string().trim().max(500).optional(),
  jobCategory: z.string().trim().max(50).optional(),
  experienceRange: z
    .enum([
      experienceRanges.BEGINNER,
      experienceRanges.ONE_TO_THREE,
      experienceRanges.FOUR_TO_SIX,
      experienceRanges.SEVEN_PLUS,
    ])
    .optional(),
  interestedTopics: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  activityAreas: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  networkingGoals: z
    .array(z.string().trim().min(1).max(60))
    .max(20)
    .default([]),
  githubUrl: optionalHttpUrl,
  portfolioUrl: optionalHttpUrl,
  isProfilePublic: z.boolean().default(false),
});

export type CommunityProfileInput = z.infer<typeof communityProfileSchema>;
