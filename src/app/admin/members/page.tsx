import { desc } from "drizzle-orm";
import type { Metadata } from "next";

import { AdminMembersTable } from "@/features/admin/components/admin-members-table";
import { db } from "@/server/db";
import { localUsers } from "@/server/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리자 회원",
};

export default async function AdminMembersPage() {
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
    })
    .from(localUsers)
    .orderBy(desc(localUsers.createdAt))
    .limit(100);

  return (
    <AdminMembersTable
      users={users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
      }))}
    />
  );
}
