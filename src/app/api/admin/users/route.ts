import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/server/auth/local/admin-security";
import { db } from "@/server/db";
import { localUsers } from "@/server/db/schema";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const sessionResult = await requireAdminApiSession({
    request,
    route: "/api/admin/users",
  });

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  const users = await db
    .select({
      id: localUsers.id,
      email: localUsers.email,
      name: localUsers.name,
      nickname: localUsers.nickname,
      phoneNumber: localUsers.phoneNumber,
      role: localUsers.role,
      status: localUsers.status,
      createdAt: localUsers.createdAt,
      lastLoginAt: localUsers.lastLoginAt,
    })
    .from(localUsers)
    .orderBy(desc(localUsers.createdAt))
    .limit(50);

  return NextResponse.json(
    {
      users,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
