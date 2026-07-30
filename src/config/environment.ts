import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  value === "" ? undefined : value;

const optionalSecret = z.preprocess(
  emptyStringToUndefined,
  z.string().min(1).optional(),
);

const optionalUrl = z.preprocess(
  emptyStringToUndefined,
  z.string().url().optional(),
);

const withHttpsProtocol = (value: string | undefined) => {
  if (!value) return undefined;

  const trimmedValue = value.trim();
  if (!trimmedValue) return undefined;

  return /^https?:\/\//.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;
};

const normalizeEnvironment = (env: NodeJS.ProcessEnv) => ({
  ...env,
  DATABASE_URL:
    env.DATABASE_URL ?? env.POSTGRES_URL ?? env.POSTGRES_PRISMA_URL,
  BETTER_AUTH_URL: withHttpsProtocol(
    env.BETTER_AUTH_URL ??
      env.NEXT_PUBLIC_APP_URL ??
      env.VERCEL_URL ??
      env.VERCEL_BRANCH_URL ??
      env.VERCEL_PROJECT_PRODUCTION_URL,
  ),
});

const environmentSchema = z.object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    VERCEL_ENV: z
      .enum(["development", "preview", "production"])
      .optional(),
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    MEMBER_JWT_SECRET: z.string().min(32),
    ADMIN_JWT_SECRET: z.string().min(32),
    LOCAL_ADMIN_EMAILS: z.string().optional().default(""),
    GOOGLE_CLIENT_ID: optionalSecret,
    GOOGLE_CLIENT_SECRET: optionalSecret,
    GITHUB_CLIENT_ID: optionalSecret,
    GITHUB_CLIENT_SECRET: optionalSecret,
    BLOB_READ_WRITE_TOKEN: optionalSecret,
    SENTRY_DSN: optionalUrl,
    SENTRY_AUTH_TOKEN: optionalSecret,
    CRON_SECRET: z.preprocess(
      emptyStringToUndefined,
      z.string().min(32).optional(),
    ),
    ANALYTICS_HASH_SECRET: z.preprocess(
      emptyStringToUndefined,
      z.string().min(32).optional(),
    ),
  });

export type Environment = z.infer<typeof environmentSchema>;

export const environment = environmentSchema.parse(
  normalizeEnvironment(process.env),
);
