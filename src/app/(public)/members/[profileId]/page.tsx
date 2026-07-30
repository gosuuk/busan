import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { recordProductEvent } from "@/features/analytics/server/record-event";
import { analyticsEvents } from "@/features/events/server/schema";
import { siteConfig } from "@/config/site";
import { db } from "@/server/db";
import { memberProfiles } from "@/server/db/schema";

interface MemberDetailPageProps {
  params: Promise<{
    profileId: string;
  }>;
}

async function getPublicProfile(profileId: string) {
  const [profile] = await db
    .select({
      id: memberProfiles.id,
      nickname: memberProfiles.nickname,
      introduction: memberProfiles.introduction,
      jobCategory: memberProfiles.jobCategory,
      experienceRange: memberProfiles.experienceRange,
      githubUrl: memberProfiles.githubUrl,
      portfolioUrl: memberProfiles.portfolioUrl,
      publicEmail: memberProfiles.publicEmail,
      metadata: memberProfiles.metadata,
    })
    .from(memberProfiles)
    .where(
      and(eq(memberProfiles.id, profileId), eq(memberProfiles.isProfilePublic, true)),
    )
    .limit(1);

  return profile ?? null;
}

export async function generateMetadata({
  params,
}: MemberDetailPageProps): Promise<Metadata> {
  const { profileId } = await params;
  const profile = await getPublicProfile(profileId);

  if (!profile) {
    return {
      title: "멤버 없음",
    };
  }

  return {
    title: `${profile.nickname} 프로필`,
    description:
      profile.introduction ??
      `${profile.nickname}님의 부산 IT 커뮤니티 공개 프로필입니다.`,
    alternates: {
      canonical: `/members/${profile.id}`,
    },
    openGraph: {
      title: `${profile.nickname} | ${siteConfig.name}`,
      description:
        profile.introduction ??
        `${profile.nickname}님의 GitHub와 포트폴리오를 확인하세요.`,
      url: `${siteConfig.url}/members/${profile.id}`,
      type: "profile",
    },
  };
}

export default async function MemberDetailPage({
  params,
}: MemberDetailPageProps) {
  const { profileId } = await params;
  const profile = await getPublicProfile(profileId);

  if (!profile) {
    notFound();
  }

  await recordProductEvent({
    eventName: analyticsEvents.memberProfileViewed,
    entityType: "profile",
    entityId: profile.id,
    pagePath: `/members/${profile.id}`,
    source: "server",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.nickname,
    description: profile.introduction,
    jobTitle: profile.jobCategory,
    email: profile.publicEmail,
    url: `${siteConfig.url}/members/${profile.id}`,
    sameAs: [profile.githubUrl, profile.portfolioUrl].filter(Boolean),
  };

  return (
    <main className="bg-paper">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />

      <section className="site-container py-12">
        <article className="rounded-3xl border border-blue-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold text-blue-600">
                Busan IT Member
              </p>
              <h1 className="mt-3 text-4xl font-bold text-ink">
                {profile.nickname}
              </h1>
              <p className="mt-3 text-base text-ink/60">
                {profile.jobCategory ?? "직군 미입력"} ·{" "}
                {profile.experienceRange ?? "경력 미입력"}
              </p>
            </div>

            {profile.metadata.isOpenToNetworking ? (
              <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                네트워킹 가능
              </span>
            ) : null}
          </div>

          <p className="mt-8 max-w-3xl whitespace-pre-line text-base leading-8 text-ink/65">
            {profile.introduction ?? "아직 소개가 없습니다."}
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <ProfileSection
              items={profile.metadata.interestedTopics}
              title="관심 기술"
            />
            <ProfileSection
              items={profile.metadata.activityAreas}
              title="활동 지역"
            />
            <ProfileSection
              items={profile.metadata.networkingGoals}
              title="참여 목적"
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {profile.githubUrl ? (
              <a
                className="rounded-xl border border-blue-100 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:border-blue-200"
                href={profile.githubUrl}
                rel="noreferrer"
                target="_blank"
              >
                GitHub 보기
              </a>
            ) : null}
            {profile.portfolioUrl ? (
              <a
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                href={profile.portfolioUrl}
                rel="noreferrer"
                target="_blank"
              >
                포트폴리오 보기
              </a>
            ) : null}
            {profile.publicEmail ? (
              <a
                className="rounded-xl bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                href={`mailto:${profile.publicEmail}`}
              >
                이메일 문의
              </a>
            ) : null}
          </div>
        </article>
      </section>
    </main>
  );
}

function ProfileSection({
  items,
  title,
}: {
  items: string[];
  title: string;
}) {
  return (
    <section className="rounded-2xl bg-blue-50 p-5">
      <h2 className="text-sm font-bold text-blue-700">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.length ? (
          items.map((item) => (
            <span
              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink/65"
              key={item}
            >
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-ink/50">미입력</span>
        )}
      </div>
    </section>
  );
}
