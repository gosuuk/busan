import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignupForm } from "@/features/auth/components/signup-form";
import {
  getPostAuthFallbackPath,
  getSafeNextPath,
} from "@/lib/navigation";
import { getMemberSessionFromCookies } from "@/server/auth/local/session";

export const metadata: Metadata = {
  title: "회원가입",
};

interface SignupPageProps {
  searchParams: Promise<{
    next?: string;
  }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { next } = await searchParams;
  const session = await getMemberSessionFromCookies();
  const nextPath = getSafeNextPath(next);

  if (session) {
    redirect(nextPath ?? getPostAuthFallbackPath(session.user.role));
  }

  return (
    <main className="bg-paper">
      <div className="site-container flex justify-center py-10 lg:py-14">
        <section className="w-full max-w-[520px] rounded-md border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="border-b border-ink/10 pb-6">
            <p className="text-sm font-semibold text-harbor">Account</p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">회원가입</h1>
          </div>

          <div className="mt-6">
            <SignupForm nextPath={nextPath} />
          </div>

          <p className="mt-6 text-sm text-ink/60">
            이미 계정이 있다면{" "}
            <Link
              className="font-semibold text-harbor"
              href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"}
            >
              로그인
            </Link>
            하세요.
          </p>
        </section>
      </div>
    </main>
  );
}
