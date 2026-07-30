"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiRequest } from "@/lib/api-client";

export function MemberLogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      await apiRequest<void>("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <button
      className="rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-ink/65 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-ink/35"
      disabled={isPending}
      onClick={handleLogout}
      type="button"
    >
      {isPending ? "로그아웃 중" : "로그아웃"}
    </button>
  );
}
