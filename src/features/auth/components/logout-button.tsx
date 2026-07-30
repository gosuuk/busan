"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "antd";

import { apiRequest } from "@/lib/api-client";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      await fetch("/api/admin/audit-actions", {
        body: JSON.stringify({
          action: "admin_logout_clicked",
          targetType: "admin_session",
        }),
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      await apiRequest<void>("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <Button disabled={isPending} onClick={handleLogout}>
      {isPending ? "로그아웃 중" : "로그아웃"}
    </Button>
  );
}
