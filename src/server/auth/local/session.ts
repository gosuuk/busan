import "server-only";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { environment } from "@/config/environment";
import { db } from "@/server/db";
import {
  localUserRoles,
  localUsers,
  localUserStatuses,
  type LocalUserRole,
} from "@/server/db/schema";

import {
  getTokenMaxAgeSeconds,
  jwtTokenTypes,
  signAuthToken,
  verifyAuthToken,
  type JwtTokenType,
} from "./jwt";

export const authCookieNames = {
  member: "busan_member_token",
  admin: "busan_admin_token",
} as const;

export interface LocalAuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    nickname: string | null;
    phoneNumber: string;
    role: LocalUserRole;
    status: string;
  };
}

interface IssueAuthCookiesInput {
  id: string;
  role: LocalUserRole;
}

export function issueAuthCookies(
  response: NextResponse,
  user: IssueAuthCookiesInput,
): void {
  response.cookies.set(
    authCookieNames.member,
    signAuthToken({
      userId: user.id,
      role: user.role,
      tokenType: jwtTokenTypes.MEMBER,
    }),
    cookieOptions(getTokenMaxAgeSeconds(jwtTokenTypes.MEMBER)),
  );

  if (user.role === localUserRoles.ADMIN) {
    response.cookies.set(
      authCookieNames.admin,
      signAuthToken({
        userId: user.id,
        role: user.role,
        tokenType: jwtTokenTypes.ADMIN,
      }),
      cookieOptions(getTokenMaxAgeSeconds(jwtTokenTypes.ADMIN)),
    );
    return;
  }

  response.cookies.delete(authCookieNames.admin);
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete(authCookieNames.member);
  response.cookies.delete(authCookieNames.admin);
}

export async function getMemberSessionFromRequest(
  request: Request,
): Promise<LocalAuthSession | null> {
  const token = getCookieFromHeader(
    request.headers.get("cookie"),
    authCookieNames.member,
  );

  return getSessionFromToken(token, jwtTokenTypes.MEMBER);
}

export async function getAdminSessionFromRequest(
  request: Request,
): Promise<LocalAuthSession | null> {
  const token = getCookieFromHeader(
    request.headers.get("cookie"),
    authCookieNames.admin,
  );

  return getSessionFromToken(token, jwtTokenTypes.ADMIN);
}

export async function getAdminSessionFromCookies(): Promise<LocalAuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieNames.admin)?.value;

  return getSessionFromToken(token, jwtTokenTypes.ADMIN);
}

export async function getMemberSessionFromCookies(): Promise<LocalAuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieNames.member)?.value;

  return getSessionFromToken(token, jwtTokenTypes.MEMBER);
}

async function getSessionFromToken(
  token: string | undefined,
  tokenType: JwtTokenType,
): Promise<LocalAuthSession | null> {
  if (!token) return null;

  const payload = verifyAuthToken(token, tokenType);
  if (!payload) return null;

  const [user] = await db
    .select({
      id: localUsers.id,
      email: localUsers.email,
      name: localUsers.name,
      nickname: localUsers.nickname,
      phoneNumber: localUsers.phoneNumber,
      role: localUsers.role,
      status: localUsers.status,
    })
    .from(localUsers)
    .where(eq(localUsers.id, payload.sub))
    .limit(1);

  if (!user || user.status !== localUserStatuses.ACTIVE) {
    return null;
  }

  if (tokenType === jwtTokenTypes.ADMIN && user.role !== localUserRoles.ADMIN) {
    return null;
  }

  return {
    user,
  };
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: environment.BETTER_AUTH_URL.startsWith("https://"),
  };
}

function getCookieFromHeader(
  cookieHeader: string | null,
  name: string,
): string | undefined {
  if (!cookieHeader) return undefined;

  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .map((cookie) => {
      const separatorIndex = cookie.indexOf("=");
      if (separatorIndex === -1) return null;

      return {
        name: cookie.slice(0, separatorIndex),
        value: decodeURIComponent(cookie.slice(separatorIndex + 1)),
      };
    })
    .find((cookie) => cookie?.name === name)?.value;
}
