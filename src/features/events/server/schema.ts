import { z } from "zod";

import { offlineEventStatuses } from "@/server/db/schema";

export const roleOptions = {
  frontend: "프론트엔드",
  backend: "백엔드",
  mobile: "모바일",
  game: "게임",
  devops: "DevOps",
  data: "데이터·AI",
  design: "디자인",
  product: "기획·PM",
  student: "학생·취업준비",
} as const;

export const analyticsEvents = {
  eventListViewed: "event_list_viewed",
  eventDetailViewed: "event_detail_viewed",
  eventApplyClicked: "event_apply_clicked",
  signupCompleted: "signup_completed",
  profileCompleted: "profile_completed",
  eventRegistrationCompleted: "event_registration_completed",
  eventRegistrationCancelled: "event_registration_cancelled",
  eventAttendanceConfirmed: "event_attendance_confirmed",
  memberDirectoryViewed: "member_directory_viewed",
  memberProfileViewed: "member_profile_viewed",
} as const;

export const createOfflineEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "모임명은 2자 이상 입력해주세요.")
      .max(120, "모임명은 120자 이하로 입력해주세요."),
    description: z
      .string()
      .trim()
      .min(1, "소개를 입력해주세요.")
      .max(3000, "소개는 3000자 이하로 입력해주세요."),
    region: z
      .string()
      .trim()
      .min(1, "부산 지역을 입력해주세요.")
      .max(80, "부산 지역은 80자 이하로 입력해주세요.")
      .default("부산"),
    locationName: z
      .string()
      .trim()
      .min(1, "장소명을 입력해주세요.")
      .max(120, "장소명은 120자 이하로 입력해주세요."),
    address: z.string().trim().max(300).optional(),
    targetRoles: z.array(z.string().max(40)).max(12).default([]),
    techTopics: z.array(z.string().max(40)).max(20).default([]),
    participationFee: z
      .string()
      .trim()
      .min(1, "참가비를 입력해주세요.")
      .max(80, "참가비는 80자 이하로 입력해주세요.")
      .default("무료"),
    startsAt: z.string().datetime("시작 시간을 선택해주세요."),
    endsAt: z.string().datetime().optional(),
    capacity: z
      .number()
      .int("정원은 정수로 입력해주세요.")
      .min(1, "정원은 1명 이상이어야 합니다.")
      .max(300, "정원은 300명 이하로 입력해주세요."),
    status: z
      .enum([
        offlineEventStatuses.DRAFT,
        offlineEventStatuses.PUBLISHED,
        offlineEventStatuses.CLOSED,
        offlineEventStatuses.CANCELED,
      ])
      .default(offlineEventStatuses.DRAFT),
  })
  .superRefine((value, context) => {
    if (!value.endsAt) return;

    if (new Date(value.endsAt) <= new Date(value.startsAt)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "종료 시간은 시작 시간보다 늦어야 합니다.",
        path: ["endsAt"],
      });
    }
  });

export type CreateOfflineEventInput = z.infer<typeof createOfflineEventSchema>;

export const applyEventSchema = z.object({
  participationReason: z.string().trim().max(500).optional(),
});

export const updateEventApplicationStatusSchema = z.object({
  attendanceStatus: z.enum([
    "registered",
    "waitlisted",
    "confirmed",
    "attended",
    "cancelled",
    "no_show",
  ]),
});

export function createEventSlug(title: string): string {
  const normalized = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const suffix = Date.now().toString(36);
  return `${normalized || "event"}-${suffix}`;
}
