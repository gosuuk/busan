import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { recordProductEvent } from "@/features/analytics/server/record-event";
import { analyticsEvents } from "@/features/events/server/schema";
import { memberProfileUpdateSchema } from "@/features/members/server/schema";
import { getMemberSessionFromRequest } from "@/server/auth/local/session";
import { db } from "@/server/db";
import { localUsers, memberProfiles } from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { recordApplicationLog } from "@/server/logging/application-log";
import {
  readJsonBody,
  RequestValidationError,
} from "@/server/security/request";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const session = await getMemberSessionFromRequest(request);

  if (!session) {
    return jsonError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const [profile] = await db
    .select()
    .from(memberProfiles)
    .where(eq(memberProfiles.userId, session.user.id))
    .limit(1);

  return NextResponse.json(
    {
      profile,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function PATCH(request: Request): Promise<Response> {
  const session = await getMemberSessionFromRequest(request);

  if (!session) {
    return jsonError("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const body = await readJsonBody(request, {
      maxBytes: 20_000,
    });
    const parsed = memberProfileUpdateSchema.parse(body);
    const now = new Date();
    const values = {
      nickname: parsed.nickname,
      introduction: parsed.introduction ?? null,
      jobCategory: parsed.jobCategory ?? null,
      experienceRange: parsed.experienceRange ?? null,
      githubUrl: parsed.githubUrl ?? null,
      portfolioUrl: parsed.portfolioUrl ?? null,
      publicEmail: parsed.publicEmail ?? null,
      metadata: {
        interestedTopics: parsed.interestedTopics,
        activityAreas: parsed.activityAreas,
        networkingGoals: parsed.networkingGoals,
        isOpenToNetworking: parsed.isOpenToNetworking,
      },
      isProfilePublic: parsed.isProfilePublic,
      updatedAt: now,
    };

    const [existingProfile] = await db
      .select({
        id: memberProfiles.id,
      })
      .from(memberProfiles)
      .where(eq(memberProfiles.userId, session.user.id))
      .limit(1);

    const [profile] = existingProfile
      ? await db
          .update(memberProfiles)
          .set(values)
          .where(eq(memberProfiles.userId, session.user.id))
          .returning()
      : await db
          .insert(memberProfiles)
          .values({
            ...values,
            userId: session.user.id,
            createdAt: now,
          })
          .returning();

    await db
      .update(localUsers)
      .set({
        nickname: parsed.nickname,
        updatedAt: now,
      })
      .where(eq(localUsers.id, session.user.id));

    await recordProductEvent({
      eventName: analyticsEvents.profileCompleted,
      entityType: "profile",
      entityId: profile.id,
      pagePath: "/profile",
      source: "web",
      userId: session.user.id,
      properties: {
        isProfilePublic: parsed.isProfilePublic,
        hasGithubUrl: Boolean(parsed.githubUrl),
        hasPortfolioUrl: Boolean(parsed.portfolioUrl),
      },
    });

    await recordApplicationLog({
      level: "info",
      message: "member profile updated",
      route: "/api/members/profile",
      method: "PATCH",
      status: "200",
      userId: session.user.id,
      metadata: {
        profileId: profile.id,
        isProfilePublic: parsed.isProfilePublic,
      },
    });

    return NextResponse.json(
      {
        profile,
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
      return jsonError("Invalid profile payload", 400, "INVALID_BODY");
    }

    await recordApplicationLog({
      level: "error",
      message: "member profile update failed",
      route: "/api/members/profile",
      method: "PATCH",
      status: "500",
      userId: session.user.id,
    });

    return jsonError("Unable to update profile", 500, "PROFILE_UPDATE_FAILED");
  }
}
