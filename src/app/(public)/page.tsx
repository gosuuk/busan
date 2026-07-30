import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";

import {
  getPublishedEventsWithSeats,
  isEventEnded,
} from "@/features/events/server/queries";
import { siteConfig } from "@/config/site";
import { db } from "@/server/db";
import { memberProfiles } from "@/server/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "부산 IT 동아리 및 커뮤니티",
  description:
    "부산에서 개발자, 디자이너, 기획자가 함께 공부하고 오프라인 모임을 여는 IT 커뮤니티입니다.",
  alternates: {
    canonical: "/",
  },
};

const operatingFlow = [
  {
    label: "01",
    title: "행사 탐색",
    description:
      "부산 지역, 기술 주제, 대상 직군, 정원과 남은 자리를 먼저 확인합니다.",
  },
  {
    label: "02",
    title: "로그인 후 신청",
    description:
      "회원가입은 최소 정보로 시작하고, 관심 기술과 포트폴리오는 나중에 채웁니다.",
  },
  {
    label: "03",
    title: "참석 확인",
    description:
      "운영자가 신청자 상태와 참석 여부를 관리해 다음 모임 기획에 반영합니다.",
  },
];

const communityTracks = [
  {
    title: "개발자",
    description: "프론트엔드, 백엔드, 모바일, DevOps, 데이터·AI 주제를 다룹니다.",
  },
  {
    title: "디자이너",
    description: "서비스 디자인, 포트폴리오 피드백, 협업 경험을 연결합니다.",
  },
  {
    title: "기획자·PM",
    description: "프로덕트 문제 정의, 실험 설계, 사이드프로젝트 팀 빌딩을 돕습니다.",
  },
  {
    title: "학생·취업준비",
    description: "첫 커뮤니티 참여자도 부담 없이 들어올 수 있는 모임을 우선합니다.",
  },
];

const principles = [
  {
    title: "행사 중심 운영",
    description:
      "글이 쌓이기 전에도 운영자가 직접 모임을 만들 수 있어 초기 활성화가 쉽습니다.",
  },
  {
    title: "부산 로컬 맥락",
    description:
      "서면, 전포, 센텀, 부산대처럼 실제로 만나기 좋은 지역 단위로 운영합니다.",
  },
  {
    title: "프로필 공개 선택",
    description:
      "GitHub, 포트폴리오, 관심 기술은 본인이 공개한 정보만 멤버 페이지에 노출합니다.",
  },
];

export default async function HomePage() {
  const [events, publicProfiles] = await Promise.all([
    getPublishedEventsWithSeats(),
    db
      .select({
        id: memberProfiles.id,
        nickname: memberProfiles.nickname,
        introduction: memberProfiles.introduction,
        jobCategory: memberProfiles.jobCategory,
        githubUrl: memberProfiles.githubUrl,
        portfolioUrl: memberProfiles.portfolioUrl,
        metadata: memberProfiles.metadata,
      })
      .from(memberProfiles)
      .where(eq(memberProfiles.isProfilePublic, true))
      .orderBy(desc(memberProfiles.createdAt))
      .limit(3),
  ]);

  const upcomingEvents = events.filter((event) => !isEventEnded(event)).slice(0, 3);
  const endedEvents = events.filter((event) => isEventEnded(event));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    areaServed: "Busan, KR",
    description:
      "부산에서 개발자, 디자이너, 기획자가 함께 공부하고 오프라인 모임을 여는 IT 커뮤니티입니다.",
    sameAs: [],
  };

  return (
    <main className="bg-paper">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />

      <section className="border-b border-blue-100 bg-[#f6faff]">
        <div className="site-container grid gap-10 py-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:items-end lg:py-16">
          <div>
            <p className="text-sm font-bold text-blue-600">Busan IT Club</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-normal text-ink sm:text-5xl lg:text-6xl">
              부산에서 직접 만나고 함께 성장하는 IT 커뮤니티
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/65">
              개발자, 디자이너, 기획자, 학생이 부산에서 오프라인 모임을 찾고
              신청하고 참석까지 이어갈 수 있도록 만든 지역 기반 커뮤니티입니다.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                href="/events"
              >
                모임 탐색하기
              </Link>
              <Link
                className="rounded-xl border border-blue-100 bg-white px-6 py-3 text-sm font-bold text-ink transition hover:border-blue-200 hover:bg-blue-50"
                href="/about"
              >
                커뮤니티 소개
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              <Metric label="공개 모임" value={`${events.length}개`} />
              <Metric label="예정 모임" value={`${upcomingEvents.length}개`} />
              <Metric label="종료 모임" value={`${endedEvents.length}개`} />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-blue-600">Upcoming</p>
                <h2 className="mt-2 text-2xl font-bold text-ink">
                  바로 참여할 수 있는 모임
                </h2>
              </div>
              <Link
                className="text-sm font-bold text-blue-700 transition hover:text-blue-800"
                href="/events"
              >
                전체 보기
              </Link>
            </div>

            {upcomingEvents.length ? (
              upcomingEvents.map((event) => (
                <Link
                  className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  href={`/events/${event.slug}`}
                  key={event.id}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          모집 중
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-ink/55">
                          {event.participationFee}
                        </span>
                      </div>
                      <h3 className="mt-3 truncate text-xl font-bold text-ink">
                        {event.title}
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-ink/60">
                        {event.startsAt.toLocaleString("ko-KR")} · {event.region} ·{" "}
                        {event.locationName}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                      {event.remainingSeats}자리 남음
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold text-ink">예정된 공개 모임 준비 중</p>
                <p className="mt-2 text-sm leading-6 text-ink/60">
                  운영자가 모임을 공개하면 이 영역에 일정, 장소, 남은 자리가
                  바로 표시됩니다.
                </p>
                <Link
                  className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                  href="/about#workflow"
                >
                  운영 흐름 보기
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="site-container py-14" id="flow">
        <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div>
            <p className="text-sm font-bold text-blue-600">Product Flow</p>
            <h2 className="mt-3 text-3xl font-bold text-ink">
              행사 탐색부터 참석 확인까지
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink/60">
              커뮤니티 게시판보다 먼저, 실제 만남이 생기는 흐름을 중심에
              두었습니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {operatingFlow.map((item) => (
              <article
                className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
                key={item.title}
              >
                <span className="text-sm font-bold text-blue-600">
                  {item.label}
                </span>
                <h3 className="mt-4 text-xl font-bold text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/60">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-white">
        <div className="site-container grid gap-8 py-14 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <p className="text-sm font-bold text-blue-600">Members</p>
            <h2 className="mt-3 text-3xl font-bold text-ink">
              부산 멤버의 GitHub와 포트폴리오
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/60">
              공개를 선택한 멤버는 관심 기술과 포트폴리오를 보여줄 수 있습니다.
              부산 개발자를 찾는 회사나 협업 파트너도 쉽게 확인할 수 있습니다.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {publicProfiles.length ? (
                publicProfiles.map((profile) => (
                  <article
                    className="rounded-2xl border border-blue-100 bg-paper p-5"
                    key={profile.id}
                  >
                    <h3 className="text-lg font-bold text-ink">
                      {profile.nickname}
                    </h3>
                    <p className="mt-1 text-sm text-ink/55">
                      {profile.jobCategory ?? "직군 미입력"}
                    </p>
                    <p className="mt-4 line-clamp-3 min-h-16 text-sm leading-6 text-ink/60">
                      {profile.introduction ?? "아직 소개가 없습니다."}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {profile.metadata.interestedTopics.slice(0, 3).map((topic) => (
                        <span
                          className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                          key={topic}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link
                        className="text-sm font-bold text-blue-700 transition hover:text-blue-800"
                        href={`/members/${profile.id}`}
                      >
                        프로필 보기
                      </Link>
                      {profile.githubUrl ? (
                        <a
                          className="text-sm font-bold text-ink/60 transition hover:text-ink"
                          href={profile.githubUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          GitHub
                        </a>
                      ) : null}
                      {profile.portfolioUrl ? (
                        <a
                          className="text-sm font-bold text-ink/60 transition hover:text-ink"
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
                <div className="rounded-2xl border border-blue-100 bg-paper p-6 text-sm leading-6 text-ink/60 md:col-span-3">
                  공개된 멤버 프로필이 아직 없습니다. 마이페이지에서 공개 프로필을
                  설정하면 이 영역에 소개됩니다.
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-2xl bg-blue-50 p-6">
            <p className="text-sm font-bold text-blue-700">Profile Guide</p>
            <h3 className="mt-3 text-2xl font-bold text-ink">
              보여주고 싶은 정보만 공개
            </h3>
            <p className="mt-4 text-sm leading-6 text-ink/60">
              닉네임, 직군, 관심 기술, GitHub, 포트폴리오, 네트워킹 가능 여부를
              선택적으로 공개합니다.
            </p>
            <Link
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              href="/profile"
            >
              프로필 설정하기
            </Link>
          </aside>
        </div>
      </section>

      <section className="site-container py-14" id="tracks">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600">Community Tracks</p>
            <h2 className="mt-3 text-3xl font-bold text-ink">
              여러 직군이 함께 만나는 구조
            </h2>
          </div>
          <Link
            className="text-sm font-bold text-blue-700 transition hover:text-blue-800"
            href="/about"
          >
            운영 방식 자세히 보기
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {communityTracks.map((track) => (
            <article
              className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
              key={track.title}
            >
              <h3 className="text-xl font-bold text-ink">{track.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/60">
                {track.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-blue-100 bg-white" id="principles">
        <div className="site-container grid gap-4 py-14 md:grid-cols-3">
          {principles.map((principle) => (
            <article className="rounded-2xl bg-paper p-6" key={principle.title}>
              <h2 className="text-xl font-bold text-ink">{principle.title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/60">
                {principle.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-container py-14">
        <div className="rounded-3xl bg-[#17202a] p-8 text-white md:p-10">
          <p className="text-sm font-bold text-blue-200">Join the community</p>
          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                다음 부산 IT 모임에서 만나보세요
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65">
                모임을 먼저 둘러보고, 관심 있는 일정이 있으면 로그인 후 바로
                신청할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-blue-50"
                href="/events"
              >
                모임 보기
              </Link>
              <Link
                className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
                href="/members"
              >
                멤버 보기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-sm">
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-xs font-bold text-ink/50">{label}</p>
    </div>
  );
}
