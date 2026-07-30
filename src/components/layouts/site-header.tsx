import Link from "next/link";

import { BusanMascot } from "@/components/brand/busan-mascot";
import { MemberLogoutButton } from "@/features/auth/components/member-logout-button";

const navigationItems = [
  {
    label: "소개",
    href: "/about",
  },
  {
    label: "모임",
    href: "/events",
  },
  {
    label: "멤버",
    href: "/members",
  },
  {
    label: "운영방식",
    href: "/about#principles",
  },
];

interface SiteHeaderProps {
  session?: {
    user: {
      name: string;
      nickname: string | null;
    };
  } | null;
}

export function SiteHeader({ session }: SiteHeaderProps) {
  const displayName = session?.user.nickname ?? session?.user.name;

  return (
    <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/85 shadow-[0_8px_30px_rgba(49,130,246,0.08)] backdrop-blur-xl">
      <div className="site-container flex h-[76px] items-center justify-between gap-6">
        <Link className="flex min-w-0 items-center gap-3" href="/">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-sm ring-4 ring-blue-50">
            <BusanMascot className="h-10 w-10" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-bold text-ink">
              부산 IT 동아리
            </span>
            <span className="block truncate text-xs text-ink/55">
              Busan builders community
            </span>
          </span>
        </Link>

        <nav
          aria-label="주요 메뉴"
          className="hidden rounded-2xl bg-slate-100/80 p-1 md:flex"
        >
          {navigationItems.map((item) => (
            <Link
              className="rounded-xl px-4 py-2 text-sm font-bold text-ink/55 transition hover:bg-white hover:text-ink hover:shadow-sm"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {session ? (
          <div className="flex items-center gap-2">
            <span className="hidden max-w-32 truncate rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-ink sm:inline">
              {displayName} 님
            </span>
            <Link
              className="rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-ink transition hover:border-blue-200 hover:bg-blue-50"
              href="/my/events"
            >
              내 일정
            </Link>
            <Link
              className="hidden rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 sm:inline-flex"
              href="/profile"
            >
              마이페이지
            </Link>
            <span className="hidden sm:inline-flex">
              <MemberLogoutButton />
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              className="rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-ink transition hover:border-blue-200 hover:bg-blue-50"
              href="/login"
            >
              로그인
            </Link>
            <Link
              className="hidden rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 sm:inline-flex"
              href="/signup"
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
