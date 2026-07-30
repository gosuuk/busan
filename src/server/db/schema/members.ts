import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const localUserRoles = {
  MEMBER: "member",
  ADMIN: "admin",
} as const;

export type LocalUserRole =
  (typeof localUserRoles)[keyof typeof localUserRoles];

export const localUserStatuses = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  DELETED: "deleted",
} as const;

export type LocalUserStatus =
  (typeof localUserStatuses)[keyof typeof localUserStatuses];

export const localUsers = pgTable(
  "local_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: varchar("name", { length: 80 }).notNull(),
    nickname: varchar("nickname", { length: 30 }),
    phoneNumber: varchar("phone_number", { length: 30 }).notNull().unique(),
    role: varchar("role", { length: 20 })
      .$type<LocalUserRole>()
      .notNull()
      .default(localUserRoles.MEMBER),
    status: varchar("status", { length: 20 })
      .$type<LocalUserStatus>()
      .notNull()
      .default(localUserStatuses.ACTIVE),
    termsVersion: varchar("terms_version", { length: 30 }).notNull(),
    privacyVersion: varchar("privacy_version", { length: 30 }).notNull(),
    requiredTermsAcceptedAt: timestamp("required_terms_accepted_at", {
      withTimezone: true,
    }).notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("local_users_email_idx").on(table.email),
    index("local_users_phone_number_idx").on(table.phoneNumber),
    index("local_users_role_status_idx").on(table.role, table.status),
  ],
);

export interface MemberProfileMetadata {
  interestedTopics: string[];
  activityAreas: string[];
  networkingGoals: string[];
  isOpenToNetworking?: boolean;
}

export const memberProfiles = pgTable(
  "member_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().unique(),
    nickname: varchar("nickname", { length: 30 }).notNull(),
    introduction: varchar("introduction", { length: 500 }),
    jobCategory: varchar("job_category", { length: 50 }),
    experienceRange: varchar("experience_range", { length: 20 }),
    githubUrl: varchar("github_url", { length: 300 }),
    portfolioUrl: varchar("portfolio_url", { length: 300 }),
    profileImageUrl: varchar("profile_image_url", { length: 500 }),
    publicEmail: varchar("public_email", { length: 255 }),
    metadata: jsonb("metadata")
      .$type<MemberProfileMetadata>()
      .notNull()
      .default({
        interestedTopics: [],
        activityAreas: [],
        networkingGoals: [],
        isOpenToNetworking: false,
      }),
    isProfilePublic: boolean("is_profile_public").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("member_profiles_nickname_idx").on(table.nickname),
    index("member_profiles_job_category_idx").on(table.jobCategory),
  ],
);

export const consentTypes = {
  TERMS: "terms",
  PRIVACY_NOTICE: "privacy-notice",
  MARKETING_EMAIL: "marketing-email",
  PROFILE_PUBLIC: "profile-public",
  EVENT_PHOTO: "event-photo",
} as const;

export const memberConsents = pgTable(
  "member_consents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    consentType: varchar("consent_type", { length: 50 }).notNull(),
    policyVersion: varchar("policy_version", { length: 30 }).notNull(),
    isGranted: boolean("is_granted").notNull(),
    source: varchar("source", { length: 30 }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("member_consents_user_type_idx").on(
      table.userId,
      table.consentType,
    ),
  ],
);
