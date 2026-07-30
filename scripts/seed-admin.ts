import { config } from "dotenv";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";

import {
  normalizeEmail,
  normalizePhoneNumber,
} from "../src/features/auth/server/schema";
import { authPolicyVersions } from "../src/features/auth/server/policy";
import { hashPassword } from "../src/lib/password-hash";
import {
  auditLogs,
  consentTypes,
  localUserRoles,
  localUsers,
  localUserStatuses,
  memberConsents,
  memberProfiles,
  offlineEvents,
  offlineEventStatuses,
} from "../src/server/db/schema";

config({
  path: ".env.local",
});

config({
  path: ".env",
  override: false,
});

const seedEnvironmentSchema = z.object({
  DATABASE_URL: z.string().url(),
  ADMIN_SEED_EMAIL: z.string().email(),
  ADMIN_SEED_PASSWORD: z
    .string()
    .min(12, "ADMIN_SEED_PASSWORD must be at least 12 characters.")
    .regex(/[A-Za-z]/, "ADMIN_SEED_PASSWORD must include a letter.")
    .regex(/[0-9]/, "ADMIN_SEED_PASSWORD must include a number."),
  ADMIN_SEED_NAME: z.string().min(1).max(80),
  ADMIN_SEED_PHONE: z.string().min(9).max(30),
});

const seedEnvironmentResult = seedEnvironmentSchema.safeParse(process.env);

if (!seedEnvironmentResult.success) {
  console.error("Invalid seed environment variables:");
  for (const issue of seedEnvironmentResult.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }
  console.error(
    "Example: ADMIN_SEED_PASSWORD=Admin1234!local",
  );
  process.exit(1);
}

const seedEnvironment = seedEnvironmentResult.data;
const sql = postgres(seedEnvironment.DATABASE_URL, {
  max: 1,
});
const db = drizzle(sql);

const email = normalizeEmail(seedEnvironment.ADMIN_SEED_EMAIL);
const phoneNumber = normalizePhoneNumber(seedEnvironment.ADMIN_SEED_PHONE);
const now = new Date();

if (phoneNumber.length < 9) {
  throw new Error("ADMIN_SEED_PHONE must contain at least 9 digits.");
}

try {
  const adminUser = await db.transaction(async (tx) => {
    const [existingUser] = await tx
      .select()
      .from(localUsers)
      .where(eq(localUsers.email, email))
      .limit(1);

    const [phoneOwner] = await tx
      .select({
        id: localUsers.id,
      })
      .from(localUsers)
      .where(eq(localUsers.phoneNumber, phoneNumber))
      .limit(1);

    if (phoneOwner && phoneOwner.id !== existingUser?.id) {
      throw new Error(
        [
          "ADMIN_SEED_PHONE is already used by another account.",
          "Change ADMIN_SEED_PHONE in .env.local to a unique local seed phone number.",
          "Example: ADMIN_SEED_PHONE=01099990000",
        ].join("\n"),
      );
    }

    const passwordHash = await hashPassword(seedEnvironment.ADMIN_SEED_PASSWORD);
    const nickname = seedEnvironment.ADMIN_SEED_NAME.slice(0, 30);

    const [user] = existingUser
      ? await tx
          .update(localUsers)
          .set({
            name: seedEnvironment.ADMIN_SEED_NAME,
            nickname,
            passwordHash,
            phoneNumber,
            role: localUserRoles.ADMIN,
            status: localUserStatuses.ACTIVE,
            termsVersion: authPolicyVersions.terms,
            privacyVersion: authPolicyVersions.privacy,
            updatedAt: now,
          })
          .where(eq(localUsers.id, existingUser.id))
          .returning()
      : await tx
          .insert(localUsers)
          .values({
            email,
            passwordHash,
            name: seedEnvironment.ADMIN_SEED_NAME,
            nickname,
            phoneNumber,
            role: localUserRoles.ADMIN,
            status: localUserStatuses.ACTIVE,
            termsVersion: authPolicyVersions.terms,
            privacyVersion: authPolicyVersions.privacy,
            requiredTermsAcceptedAt: now,
            emailVerifiedAt: now,
          })
          .returning();

    const [existingProfile] = await tx
      .select({
        id: memberProfiles.id,
      })
      .from(memberProfiles)
      .where(eq(memberProfiles.userId, user.id))
      .limit(1);

    if (!existingProfile) {
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
    }

    await ensureConsent(tx, user.id, consentTypes.TERMS, authPolicyVersions.terms);
    await ensureConsent(
      tx,
      user.id,
      consentTypes.PRIVACY_NOTICE,
      authPolicyVersions.privacy,
    );

    await tx.insert(auditLogs).values({
      actorUserId: user.id,
      actorRole: localUserRoles.ADMIN,
      action: existingUser ? "admin_seed_updated" : "admin_seed_created",
      targetType: "local_user",
      targetId: user.id,
      reason: "local seed",
      metadata: {
        source: "scripts/seed-admin",
      },
      occurredAt: now,
    });

    const [existingSeedEvent] = await tx
      .select({
        id: offlineEvents.id,
      })
      .from(offlineEvents)
      .where(eq(offlineEvents.slug, "next-js-busan-meetup"))
      .limit(1);

    if (!existingSeedEvent) {
      const startsAt = createSeedEventStart(now);
      const endsAt = new Date(startsAt);
      endsAt.setHours(endsAt.getHours() + 2);

      await tx.insert(offlineEvents).values({
        title: "Next.js 부산 밋업",
        slug: "next-js-busan-meetup",
        description:
          "부산에서 Next.js와 TypeScript를 쓰는 개발자가 만나 최근 프로젝트 경험과 운영 고민을 나누는 소규모 모임입니다.",
        region: "서면",
        locationName: "전포 카페",
        address: "부산 부산진구 전포동",
        targetRoles: ["프론트엔드", "백엔드"],
        techTopics: ["Next.js", "TypeScript", "React"],
        participationFee: "무료",
        startsAt,
        endsAt,
        capacity: 20,
        status: offlineEventStatuses.PUBLISHED,
        createdByUserId: user.id,
        metadata: {
          source: "scripts/seed-admin",
        },
      });
    }

    return user;
  });

  console.info(`Admin seed ready: ${adminUser.email}`);
} catch (error) {
  console.error("Admin seed failed:");
  console.error(formatSeedError(error));
  process.exitCode = 1;
} finally {
  await sql.end();
}

function createSeedEventStart(baseDate: Date): Date {
  const startsAt = new Date(baseDate);
  startsAt.setDate(startsAt.getDate() + 7);
  startsAt.setHours(19, 30, 0, 0);
  return startsAt;
}

function formatSeedError(error: unknown): string {
  if (error instanceof AggregateError) {
    return error.errors
      .map((item) => {
        if (!(item instanceof Error)) {
          return String(item);
        }

        const code = (item as { code?: unknown }).code;
        return typeof code === "string"
          ? `${code}: ${item.message}`
          : item.message;
      })
      .join("\n");
  }

  return error instanceof Error ? error.message : String(error);
}

async function ensureConsent(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  userId: string,
  consentType: string,
  policyVersion: string,
): Promise<void> {
  const [existingConsent] = await tx
    .select({
      id: memberConsents.id,
    })
    .from(memberConsents)
    .where(
      and(
        eq(memberConsents.userId, userId),
        eq(memberConsents.consentType, consentType),
        eq(memberConsents.policyVersion, policyVersion),
      ),
    )
    .limit(1);

  if (existingConsent) return;

  await tx.insert(memberConsents).values({
    userId,
    consentType,
    policyVersion,
    isGranted: true,
    source: "seed",
    occurredAt: now,
  });
}
