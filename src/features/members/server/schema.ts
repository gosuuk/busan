import { z } from "zod";

const optionalUrlSchema = z
  .string()
  .trim()
  .url()
  .max(300)
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalEmailSchema = z
  .string()
  .trim()
  .email()
  .max(255)
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalTextSchema = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));

export const memberProfileUpdateSchema = z.object({
  nickname: z.string().trim().min(1).max(30),
  introduction: optionalTextSchema(500),
  jobCategory: optionalTextSchema(50),
  experienceRange: optionalTextSchema(20),
  githubUrl: optionalUrlSchema,
  portfolioUrl: optionalUrlSchema,
  publicEmail: optionalEmailSchema,
  interestedTopics: z.array(z.string().trim().min(1).max(40)).max(20),
  activityAreas: z.array(z.string().trim().min(1).max(40)).max(12),
  networkingGoals: z.array(z.string().trim().min(1).max(60)).max(12),
  isOpenToNetworking: z.boolean(),
  isProfilePublic: z.boolean(),
});

export type MemberProfileUpdateInput = z.infer<
  typeof memberProfileUpdateSchema
>;

export const roleSelectOptions = [
  "프론트엔드",
  "백엔드",
  "모바일",
  "게임",
  "DevOps",
  "데이터·AI",
  "디자인",
  "기획·PM",
  "학생·취업준비",
] as const;

export const careerLevelOptions = [
  "입문",
  "주니어",
  "미들",
  "시니어",
  "리드",
  "학생·취업준비",
] as const;
