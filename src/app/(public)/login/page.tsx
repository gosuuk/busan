import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import {
  getPostAuthFallbackPath,
  getSafeNextPath,
} from "@/lib/navigation";
import { getMemberSessionFromCookies } from "@/server/auth/local/session";

export const metadata: Metadata = {
  title: "로그인",
};

interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const session = await getMemberSessionFromCookies();
  const nextPath = getSafeNextPath(next);

  if (session) {
    redirect(nextPath ?? getPostAuthFallbackPath(session.user.role));
  }

  return (
    <main className="bg-paper">
      <div className="site-container flex justify-center py-10 lg:py-16">
        <section className="w-full max-w-md rounded-md border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="border-b border-ink/10 pb-6">
            <p className="text-sm font-semibold text-harbor">Account</p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">로그인</h1>
          </div>

          <div className="mt-6">
            <LoginForm nextPath={nextPath} />
          </div>

          <p className="mt-6 text-sm text-ink/60">
            계정이 없다면{" "}
            <Link
              className="font-semibold text-harbor"
              href={nextPath ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup"}
            >
              회원가입
            </Link>
            을 진행하세요.
          </p>
        </section>
      </div>
    </main>
  );
}
