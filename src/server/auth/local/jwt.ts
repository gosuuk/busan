import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { environment } from "@/config/environment";
import {
  localUserRoles,
  type LocalUserRole,
} from "@/server/db/schema";

export const jwtTokenTypes = {
  MEMBER: "member",
  ADMIN: "admin",
} as const;

export type JwtTokenType = (typeof jwtTokenTypes)[keyof typeof jwtTokenTypes];

export interface AuthTokenPayload {
  sub: string;
  role: LocalUserRole;
  tokenType: JwtTokenType;
  iat: number;
  exp: number;
  jti: string;
}

interface SignAuthTokenInput {
  userId: string;
  role: LocalUserRole;
  tokenType: JwtTokenType;
}

const tokenMaxAgeSeconds = {
  [jwtTokenTypes.MEMBER]: 60 * 60 * 24 * 7,
  [jwtTokenTypes.ADMIN]: 60 * 60 * 2,
} as const;

export function signAuthToken(input: SignAuthTokenInput): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AuthTokenPayload = {
    sub: input.userId,
    role: input.role,
    tokenType: input.tokenType,
    iat: now,
    exp: now + tokenMaxAgeSeconds[input.tokenType],
    jti: randomUUID(),
  };

  return signJwt(payload, getSecret(input.tokenType));
}

export function verifyAuthToken(
  token: string,
  expectedTokenType: JwtTokenType,
): AuthTokenPayload | null {
  const payload = verifyJwt(token, getSecret(expectedTokenType));

  if (!payload) return null;
  if (payload.tokenType !== expectedTokenType) return null;
  if (payload.exp <= Math.floor(Date.now() / 1000)) return null;

  if (
    expectedTokenType === jwtTokenTypes.ADMIN &&
    payload.role !== localUserRoles.ADMIN
  ) {
    return null;
  }

  return payload;
}

export function getTokenMaxAgeSeconds(tokenType: JwtTokenType): number {
  return tokenMaxAgeSeconds[tokenType];
}

function signJwt(payload: AuthTokenPayload, secret: string): string {
  const encodedHeader = base64UrlEncode({
    alg: "HS256",
    typ: "JWT",
  });
  const encodedPayload = base64UrlEncode(payload);
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createSignature(signingInput, secret);

  return `${signingInput}.${signature}`;
}

function verifyJwt(token: string, secret: string): AuthTokenPayload | null {
  const [encodedHeader, encodedPayload, signature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !signature) {
    return null;
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = createSignature(signingInput, secret);

  if (!constantTimeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<AuthTokenPayload>;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.tokenType !== "string" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number" ||
      typeof payload.jti !== "string"
    ) {
      return null;
    }

    return payload as AuthTokenPayload;
  } catch {
    return null;
  }
}

function createSignature(signingInput: string, secret: string): string {
  return createHmac("sha256", secret).update(signingInput).digest("base64url");
}

function base64UrlEncode(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "base64url");
  const rightBuffer = Buffer.from(right, "base64url");

  if (leftBuffer.byteLength !== rightBuffer.byteLength) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getSecret(tokenType: JwtTokenType): string {
  if (tokenType === jwtTokenTypes.ADMIN) {
    return environment.ADMIN_JWT_SECRET;
  }

  return environment.MEMBER_JWT_SECRET;
}
