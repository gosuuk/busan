import { describe, expect, it } from "vitest";

import {
  applyTeamRoomSchema,
  createOfflineEventSchema,
  createTeamRoomSchema,
  updateTeamApplicationSchema,
} from "./schema";

const validEvent = {
  title: "부산 AI 해커톤",
  category: "hackathon",
  description: "부산에서 함께 만드는 AI 서비스 해커톤입니다.",
  region: "부산",
  locationName: "부산창업카페",
  targetRoles: ["프론트엔드", "백엔드"],
  techTopics: ["AI", "Next.js"],
  participationFee: "무료",
  startsAt: "2027-01-10T01:00:00.000Z",
  endsAt: "2027-01-11T01:00:00.000Z",
  capacity: 100,
  status: "pending",
};

describe("event schemas", () => {
  it("accepts a categorized member event submission", () => {
    const result = createOfflineEventSchema.parse(validEvent);

    expect(result.category).toBe("hackathon");
    expect(result.status).toBe("pending");
  });

  it("rejects an unsupported category", () => {
    expect(() =>
      createOfflineEventSchema.parse({ ...validEvent, category: "party" }),
    ).toThrow();
  });

  it("rejects a team room with fewer than two total members", () => {
    expect(() =>
      createTeamRoomSchema.parse({
        title: "AI 팀",
        description: "AI 서비스를 함께 개발할 팀원을 모집합니다.",
        neededRoles: ["백엔드"],
        capacity: 1,
      }),
    ).toThrow();
  });

  it("allows only leader approval or rejection states", () => {
    expect(updateTeamApplicationSchema.parse({ status: "accepted" })).toEqual({
      status: "accepted",
    });
    expect(() =>
      updateTeamApplicationSchema.parse({ status: "cancelled" }),
    ).toThrow();
  });

  it("requires explicit profile disclosure consent when applying to a team", () => {
    expect(
      applyTeamRoomSchema.parse({
        message: "프론트엔드 역할로 참여하고 싶습니다.",
        profileDisclosureConsent: true,
      }),
    ).toMatchObject({ profileDisclosureConsent: true });

    expect(() =>
      applyTeamRoomSchema.parse({
        message: "동의하지 않은 지원",
        profileDisclosureConsent: false,
      }),
    ).toThrow();
  });
});
