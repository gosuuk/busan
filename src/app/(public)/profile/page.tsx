import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MemberProfileForm } from "@/features/members/components/member-profile-form";
import { getMemberSessionFromCookies } from "@/server/auth/local/session";
import { db } from "@/server/db";
import { memberProfiles } from "@/server/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "프로필",
  description:
    "부산 IT 동아리 및 커뮤니티 멤버 프로필, GitHub, 포트폴리오 공개 설정을 관리합니다.",
  alternates: {
    canonical: "/profile",
  },
};

interface ProfilePageProps {
  searchParams: Promise<{
    next?: string;
  }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const session = await getMemberSessionFromCookies();

  const { next } = await searchParams;
  const nextPath = next?.startsWith("/") ? next : undefined;

  if (!session) {
    const loginNextPath = nextPath
      ? `/profile?next=${encodeURIComponent(nextPath)}`
      : "/profile";
    redirect(`/login?next=${encodeURIComponent(loginNextPath)}`);
  }

  const [profile] = await db
    .select()
    .from(memberProfiles)
    .where(eq(memberProfiles.userId, session.user.id))
    .limit(1);

  return (
    <main className="bg-paper">
      <section className="site-container py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-blue-600">Profile</p>
          <h1 className="mt-3 text-4xl font-bold text-ink">멤버 프로필</h1>
          <p className="mt-4 text-base leading-7 text-ink/60">
            행사 신청 이후 필요한 선택 정보를 정리하고, 공개 설정 시 멤버
            디렉터리에 노출합니다.
          </p>
        </div>

        <section className="mt-8 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm lg:p-8">
          <MemberProfileForm
            initialProfile={{
              id: profile?.id,
              nickname:
                profile?.nickname ??
                session.user.nickname ??
                session.user.name.slice(0, 30),
              introduction: profile?.introduction ?? null,
              jobCategory: profile?.jobCategory ?? null,
              experienceRange: profile?.experienceRange ?? null,
              githubUrl: profile?.githubUrl ?? null,
              portfolioUrl: profile?.portfolioUrl ?? null,
              publicEmail: profile?.publicEmail ?? null,
              metadata: profile?.metadata ?? {
                interestedTopics: [],
                activityAreas: [],
                networkingGoals: [],
                isOpenToNetworking: false,
              },
              isProfilePublic: profile?.isProfilePublic ?? false,
            }}
            nextPath={nextPath}
          />
        </section>
      </section>
    </main>
  );
}
