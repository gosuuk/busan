import { config } from "dotenv";
import { z } from "zod";

import {
  normalizeEmail,
  normalizePhoneNumber,
} from "../src/features/auth/server/schema";
import { authPolicyVersions } from "../src/features/auth/server/policy";
import { hashPassword } from "../src/lib/password-hash";

config({
  path: ".env.local",
});

config({
  path: ".env",
  override: false,
});

const adminSqlEnvironmentSchema = z.object({
  ADMIN_SQL_EMAIL: z
    .string()
    .email()
    .optional()
    .default(process.env.ADMIN_SEED_EMAIL ?? "admin@example.com"),
  ADMIN_SQL_PASSWORD: z
    .string()
    .min(12, "ADMIN_SQL_PASSWORD must be at least 12 characters.")
    .regex(/[A-Za-z]/, "ADMIN_SQL_PASSWORD must include a letter.")
    .regex(/[0-9]/, "ADMIN_SQL_PASSWORD must include a number.")
    .optional()
    .default(process.env.ADMIN_SEED_PASSWORD ?? ""),
  ADMIN_SQL_NAME: z
    .string()
    .min(1)
    .max(80)
    .optional()
    .default(process.env.ADMIN_SEED_NAME ?? "관리자"),
  ADMIN_SQL_PHONE: z
    .string()
    .min(9)
    .max(30)
    .optional()
    .default(process.env.ADMIN_SEED_PHONE ?? "01099990000"),
});

const parsedEnvironment = adminSqlEnvironmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error("Invalid admin SQL environment variables:");
  for (const issue of parsedEnvironment.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }
  console.error("");
  console.error("Example:");
  console.error(
    'ADMIN_SQL_EMAIL="admin@example.com" ADMIN_SQL_PASSWORD="Admin1234!local" ADMIN_SQL_NAME="관리자" ADMIN_SQL_PHONE="01099990000" pnpm admin:sql > admin.sql',
  );
  process.exit(1);
}

const adminInput = parsedEnvironment.data;
const email = normalizeEmail(adminInput.ADMIN_SQL_EMAIL);
const phoneNumber = normalizePhoneNumber(adminInput.ADMIN_SQL_PHONE);
const nickname = adminInput.ADMIN_SQL_NAME.slice(0, 30);
const passwordHash = await hashPassword(adminInput.ADMIN_SQL_PASSWORD);

if (phoneNumber.length < 9) {
  console.error("ADMIN_SQL_PHONE must contain at least 9 digits.");
  process.exit(1);
}

console.info(
  [
    "-- Busan IT community direct admin SQL",
    "-- Paste this SQL into the production PostgreSQL SQL editor.",
    "-- The password is not stored in plaintext; only the app-compatible scrypt hash is inserted.",
    `-- Admin email: ${email}`,
    "",
    "BEGIN;",
    "",
    "WITH admin_input AS (",
    "  SELECT",
    `    ${sqlLiteral(email)}::varchar(255) AS email,`,
    `    ${sqlLiteral(passwordHash)}::text AS password_hash,`,
    `    ${sqlLiteral(adminInput.ADMIN_SQL_NAME)}::varchar(80) AS name,`,
    `    ${sqlLiteral(nickname)}::varchar(30) AS nickname,`,
    `    ${sqlLiteral(phoneNumber)}::varchar(30) AS phone_number,`,
    `    ${sqlLiteral(authPolicyVersions.terms)}::varchar(30) AS terms_version,`,
    `    ${sqlLiteral(authPolicyVersions.privacy)}::varchar(30) AS privacy_version`,
    "),",
    "upsert_user AS (",
    "  INSERT INTO local_users (",
    "    email,",
    "    password_hash,",
    "    name,",
    "    nickname,",
    "    phone_number,",
    "    role,",
    "    status,",
    "    terms_version,",
    "    privacy_version,",
    "    required_terms_accepted_at,",
    "    email_verified_at,",
    "    created_at,",
    "    updated_at",
    "  )",
    "  SELECT",
    "    email,",
    "    password_hash,",
    "    name,",
    "    nickname,",
    "    phone_number,",
    "    'admin',",
    "    'active',",
    "    terms_version,",
    "    privacy_version,",
    "    now(),",
    "    now(),",
    "    now(),",
    "    now()",
    "  FROM admin_input",
    "  ON CONFLICT (email) DO UPDATE SET",
    "    password_hash = EXCLUDED.password_hash,",
    "    name = EXCLUDED.name,",
    "    nickname = EXCLUDED.nickname,",
    "    phone_number = EXCLUDED.phone_number,",
    "    role = 'admin',",
    "    status = 'active',",
    "    terms_version = EXCLUDED.terms_version,",
    "    privacy_version = EXCLUDED.privacy_version,",
    "    email_verified_at = COALESCE(local_users.email_verified_at, now()),",
    "    updated_at = now()",
    "  RETURNING id, email, name, nickname",
    "),",
    "ensure_profile AS (",
    "  INSERT INTO member_profiles (",
    "    user_id,",
    "    nickname,",
    "    metadata,",
    "    is_profile_public,",
    "    created_at,",
    "    updated_at",
    "  )",
    "  SELECT",
    "    id::text,",
    "    COALESCE(nickname, name),",
    "    '{\"interestedTopics\":[],\"activityAreas\":[],\"networkingGoals\":[],\"isOpenToNetworking\":false}'::jsonb,",
    "    false,",
    "    now(),",
    "    now()",
    "  FROM upsert_user",
    "  ON CONFLICT (user_id) DO UPDATE SET",
    "    nickname = EXCLUDED.nickname,",
    "    updated_at = now()",
    "  RETURNING user_id",
    "),",
    "ensure_terms_consent AS (",
    "  INSERT INTO member_consents (",
    "    user_id,",
    "    consent_type,",
    "    policy_version,",
    "    is_granted,",
    "    source,",
    "    occurred_at",
    "  )",
    "  SELECT",
    "    upsert_user.id::text,",
    "    'terms',",
    "    admin_input.terms_version,",
    "    true,",
    "    'manual-sql',",
    "    now()",
    "  FROM upsert_user",
    "  CROSS JOIN admin_input",
    "  WHERE NOT EXISTS (",
    "    SELECT 1",
    "    FROM member_consents",
    "    WHERE member_consents.user_id = upsert_user.id::text",
    "      AND member_consents.consent_type = 'terms'",
    "      AND member_consents.policy_version = admin_input.terms_version",
    "      AND member_consents.is_granted = true",
    "  )",
    "  RETURNING id",
    "),",
    "ensure_privacy_consent AS (",
    "  INSERT INTO member_consents (",
    "    user_id,",
    "    consent_type,",
    "    policy_version,",
    "    is_granted,",
    "    source,",
    "    occurred_at",
    "  )",
    "  SELECT",
    "    upsert_user.id::text,",
    "    'privacy-notice',",
    "    admin_input.privacy_version,",
    "    true,",
    "    'manual-sql',",
    "    now()",
    "  FROM upsert_user",
    "  CROSS JOIN admin_input",
    "  WHERE NOT EXISTS (",
    "    SELECT 1",
    "    FROM member_consents",
    "    WHERE member_consents.user_id = upsert_user.id::text",
    "      AND member_consents.consent_type = 'privacy-notice'",
    "      AND member_consents.policy_version = admin_input.privacy_version",
    "      AND member_consents.is_granted = true",
    "  )",
    "  RETURNING id",
    "),",
    "audit AS (",
    "  INSERT INTO audit_logs (",
    "    actor_user_id,",
    "    actor_role,",
    "    action,",
    "    target_type,",
    "    target_id,",
    "    reason,",
    "    metadata,",
    "    occurred_at",
    "  )",
    "  SELECT",
    "    id::text,",
    "    'admin',",
    "    'admin_manual_sql_upserted',",
    "    'local_user',",
    "    id::text,",
    "    'manual production sql',",
    "    '{\"source\":\"scripts/print-admin-sql\"}'::jsonb,",
    "    now()",
    "  FROM upsert_user",
    "  RETURNING id",
    ")",
    "SELECT",
    "  'admin_ready' AS result,",
    "  id,",
    "  email,",
    "  name",
    "FROM upsert_user;",
    "",
    "COMMIT;",
  ].join("\n"),
);

function sqlLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}
