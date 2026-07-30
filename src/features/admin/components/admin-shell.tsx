"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button, Card, Menu, Space } from "antd";
import type { MenuProps } from "antd";

import { LogoutButton } from "@/features/auth/components/logout-button";

interface AdminShellProps {
  children: React.ReactNode;
  currentAdmin: {
    email: string;
    name: string;
  };
}

const navigationItems = [
  {
    key: "/admin",
    label: "대시보드",
  },
  {
    key: "/admin/members",
    label: "회원",
  },
  {
    key: "/admin/events",
    label: "모임",
  },
  {
    key: "/admin/events/new",
    label: "모임 생성",
  },
  {
    key: "/admin/applications",
    label: "신청자",
  },
  {
    key: "/admin/feedback",
    label: "제안·버그",
  },
  {
    key: "/admin/logs",
    label: "로그",
  },
] satisfies NonNullable<MenuProps["items"]>;

export function AdminShell({ children, currentAdmin }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const selectedKey =
    navigationItems
      .map((item) => item.key)
      .sort((a, b) => b.length - a.length)
      .find((key) => pathname === key || pathname.startsWith(`${key}/`)) ??
    "/admin";
  const pageTitle = getPageTitle(pathname, selectedKey);

  async function handleMenuClick(key: string) {
    await recordAudit("admin_nav_clicked", "admin_navigation", {
      path: key,
    });
    router.push(key);
  }

  async function handleApiOpen() {
    await recordAudit("admin_api_users_opened", "admin_api", {
      source: "admin_shell",
    });
    window.location.assign("/api/admin/users");
  }

  async function handleRefresh() {
    await recordAudit("admin_users_refresh_clicked", "admin_page", {
      path: pathname,
    });
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#eef6ff]">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-6 py-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 lg:py-8">
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <Card variant="outlined" className="shadow-sm">
            <div className="border-b border-blue-100 pb-5">
              <span className="text-xs font-bold uppercase text-blue-600">
                refine admin
              </span>
              <h1 className="mt-2 text-xl font-bold text-ink">운영 콘솔</h1>
              <p className="mt-2 text-sm leading-6 text-ink/60">
                Next.js, refine, Ant Design 기반 관리자 화면입니다.
              </p>
            </div>

            <Menu
              className="mt-5 border-none"
              items={navigationItems}
              mode="inline"
              onClick={(event: { key: string }) => handleMenuClick(event.key)}
              selectedKeys={[selectedKey]}
            />

            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <p className="text-xs font-semibold text-ink/50">현재 관리자</p>
              <p className="mt-2 text-sm font-bold text-ink">
                {currentAdmin.name}
              </p>
              <p className="mt-1 truncate text-xs text-ink/55">
                {currentAdmin.email}
              </p>
            </div>
          </Card>
        </aside>

        <section className="min-w-0">
          <div className="mb-6 flex flex-col gap-4 border-b border-blue-100 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-sm font-bold text-blue-600">Admin</span>
              <h2 className="mt-2 text-3xl font-bold text-ink">
                {pageTitle}
              </h2>
            </div>

            <Space wrap>
              <Button onClick={handleApiOpen} type="primary">
                API 확인
              </Button>
              <Button onClick={handleRefresh}>새로고침</Button>
              <LogoutButton />
            </Space>
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}

async function recordAudit(
  action:
    | "admin_nav_clicked"
    | "admin_api_users_opened"
    | "admin_users_refresh_clicked",
  targetType: string,
  metadata: Record<string, string | number | boolean | null>,
) {
  await fetch("/api/admin/audit-actions", {
    body: JSON.stringify({
      action,
      metadata,
      targetType,
    }),
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

function getPageTitle(pathname: string, selectedKey: string): string {
  if (pathname.includes("/events/") && pathname.endsWith("/edit")) {
    return "모임 수정";
  }

  return navigationItems.find((item) => item.key === selectedKey)?.label ?? "관리자 페이지";
}
