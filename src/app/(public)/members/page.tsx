import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";

import { recordProductEvent } from "@/features/analytics/server/record-event";
import { analyticsEvents } from "@/features/events/server/schema";
import { db } from "@/server/db";
import { memberProfiles } from "@/server/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "부산 IT 멤버",
  description:
    "부산 IT 동아리 및 커뮤니티에서 공개한 개발자, 디자이너, 기획자 프로필과 GitHub, 포트폴리오를 확인하세요.",
  alternates: {
    canonical: "/members",
  },
};

export default async function MembersPage() {
  const profiles = await db
    .select({
      id: memberProfiles.id,
      nickname: memberProfiles.nickname,
      introduction: memberProfiles.introduction,
      jobCategory: memberProfiles.jobCategory,
      experienceRange: memberProfiles.experienceRange,
      githubUrl: memberProfiles.githubUrl,
      portfolioUrl: memberProfiles.portfolioUrl,
      metadata: memberProfiles.metadata,
      createdAt: memberProfiles.createdAt,
    })
    .from(memberProfiles)
    .where(eq(memberProfiles.isProfilePublic, true))
    .orderBy(desc(memberProfiles.createdAt));

  await recordProductEvent({
    eventName: analyticsEvents.memberDirectoryViewed,
    pagePath: "/members",
    source: "server",
  });

  return (
    <main className="bg-paper">
      <section className="site-container py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-blue-600">Members</p>
          <h1 className="mt-3 text-4xl font-bold text-ink">
            부산 IT 멤버 디렉터리
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/60">
            공개 설정한 멤버의 관심 기술, GitHub, 포트폴리오를 확인할 수
            있습니다.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.length ? (
            profiles.map((profile) => (
              <article
                className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm"
                key={profile.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-ink">
                      {profile.nickname}
                    </h2>
                    <p className="mt-1 text-sm text-ink/55">
                      {profile.jobCategory ?? "직군 미입력"} ·{" "}
                      {profile.experienceRange ?? "경력 미입력"}
                    </p>
                  </div>
                  {profile.metadata.isOpenToNetworking ? (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      네트워킹 가능
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 min-h-12 text-sm leading-6 text-ink/60">
                  {profile.introduction ?? "아직 소개가 없습니다."}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {profile.metadata.interestedTopics.slice(0, 6).map((topic) => (
                    <span
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                      key={topic}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                    href={`/members/${profile.id}`}
                  >
                    자세히 보기
                  </Link>
                  {profile.githubUrl ? (
                    <a
                      className="rounded-xl border border-blue-100 px-4 py-2 text-sm font-bold text-ink transition hover:border-blue-200"
                      href={profile.githubUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      GitHub
                    </a>
                  ) : null}
                  {profile.portfolioUrl ? (
                    <a
                      className="rounded-xl border border-blue-100 px-4 py-2 text-sm font-bold text-ink transition hover:border-blue-200"
                      href={profile.portfolioUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      포트폴리오
                    </a>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-blue-100 bg-white p-8 text-sm text-ink/60 md:col-span-2 xl:col-span-3">
              아직 공개된 멤버 프로필이 없습니다.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
