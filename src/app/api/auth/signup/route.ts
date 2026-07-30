import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  normalizeEmail,
  normalizePhoneNumber,
  signupRequestSchema,
} from "@/features/auth/server/schema";
import { recordProductEvent } from "@/features/analytics/server/record-event";
import { analyticsEvents } from "@/features/events/server/schema";
import { authPolicyVersions } from "@/features/auth/server/policy";
import { db } from "@/server/db";
import {
  consentTypes,
  localUsers,
  memberConsents,
  memberProfiles,
} from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { resolveSignupRole } from "@/server/auth/local/admin";
import {
  getMemberSessionFromRequest,
  issueAuthCookies,
} from "@/server/auth/local/session";
import { hashPassword } from "@/server/auth/local/password";
import { recordApplicationLog } from "@/server/logging/application-log";
import { getClientIp } from "@/server/security/client-ip";
import { checkRateLimit } from "@/server/security/rate-limit";
import {
  readJsonBody,
  RequestValidationError,
} from "@/server/security/request";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const currentSession = await getMemberSessionFromRequest(request);

  if (currentSession) {
    return jsonError("Already authenticated", 409, "ALREADY_AUTHENTICATED");
  }

  const rateLimit = checkRateLimit(`signup:${getClientIp(request)}`, {
    limit: 10,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return jsonError("Too many requests", 429, "RATE_LIMITED");
  }

  try {
    const body = await readJsonBody(request, {
      maxBytes: 20_000,
    });
    const parsed = signupRequestSchema.parse(body);
    const email = normalizeEmail(parsed.email);
    const phoneNumber = normalizePhoneNumber(parsed.phoneNumber);

    if (phoneNumber.length < 9) {
      return jsonError("Invalid signup payload", 400, "INVALID_BODY");
    }

    const [existingUser] = await db
      .select({
        id: localUsers.id,
      })
      .from(localUsers)
      .where(
        or(eq(localUsers.email, email), eq(localUsers.phoneNumber, phoneNumber)),
      )
      .limit(1);

    if (existingUser) {
      return jsonError("Email or phone number is already registered", 409, "DUPLICATE_USER");
    }

    const now = new Date();
    const passwordHash = await hashPassword(parsed.password);
    const role = resolveSignupRole(email);
    const nickname = parsed.nickname ?? parsed.name.slice(0, 30);

    const createdUser = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(localUsers)
        .values({
          email,
          passwordHash,
          name: parsed.name,
          nickname,
          phoneNumber,
          role,
          termsVersion: authPolicyVersions.terms,
          privacyVersion: authPolicyVersions.privacy,
          requiredTermsAcceptedAt: now,
        })
        .returning({
          id: localUsers.id,
          email: localUsers.email,
          name: localUsers.name,
          nickname: localUsers.nickname,
          phoneNumber: localUsers.phoneNumber,
          role: localUsers.role,
          status: localUsers.status,
        });

      await tx.insert(memberProfiles).values({
        userId: user.id,
        nickname,
        metadata: {
          interestedTopics: [],
          activityAreas: [],
          networkingGoals: [],
          isOpenToNetworking: false,
        },
        isProfilePublic: false,
      });

      await tx.insert(memberConsents).values([
        {
          userId: user.id,
          consentType: consentTypes.TERMS,
          policyVersion: authPolicyVersions.terms,
          isGranted: true,
          source: "signup",
          occurredAt: now,
        },
        {
          userId: user.id,
          consentType: consentTypes.PRIVACY_NOTICE,
          policyVersion: authPolicyVersions.privacy,
          isGranted: true,
          source: "signup",
          occurredAt: now,
        },
      ]);

      return user;
    });

    const response = NextResponse.json(
      {
        user: createdUser,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );

    issueAuthCookies(response, createdUser);
    await recordProductEvent({
      eventName: analyticsEvents.signupCompleted,
      entityType: "profile",
      pagePath: "/signup",
      source: "web",
      userId: createdUser.id,
    });
    await recordApplicationLog({
      level: "info",
      message: "local user signed up",
      route: "/api/auth/signup",
      method: "POST",
      status: "201",
      userId: createdUser.id,
    });

    return response;
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return jsonError(error.message, error.status, error.code);
    }

    if (error instanceof ZodError) {
      return jsonError("Invalid signup payload", 400, "INVALID_BODY");
    }

    await recordApplicationLog({
      level: "error",
      message: "local signup failed",
      route: "/api/auth/signup",
      method: "POST",
      status: "500",
    });

    return jsonError("Unable to create account", 500, "SIGNUP_FAILED");
  }
}
