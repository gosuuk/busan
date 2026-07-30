import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";

import { CommunityFeedbackForm } from "@/features/community/components/community-feedback-form";
import { siteConfig } from "@/config/site";
import { getMemberSessionFromCookies } from "@/server/auth/local/session";
import { db } from "@/server/db";
import {
  communityFeedback,
  communityFeedbackStatuses,
  communityFeedbackTypes,
} from "@/server/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "커뮤니티 소개",
  description:
    "부산 IT 동아리 및 커뮤니티의 운영 목적, 행사 중심 흐름, 멤버 프로필 공개 방식과 개인정보 원칙을 소개합니다.",
  alternates: {
    canonical: "/about",
  },
};

const reasons = [
  {
    title: "빈 게시판보다 실제 모임",
    description:
      "초기 커뮤니티는 글보다 만남이 먼저 필요합니다. 운영자가 직접 행사를 만들고 참가자를 모으는 구조로 시작합니다.",
  },
  {
    title: "부산에서 만나는 동료",
    description:
      "온라인 대형 커뮤니티에서 놓치기 쉬운 지역성, 이동 거리, 실제 협업 가능성을 중심에 둡니다.",
  },
  {
    title: "포트폴리오가 연결되는 장",
    description:
      "멤버가 공개한 GitHub와 포트폴리오를 통해 부산 기반 협업, 채용, 프로젝트 제안을 더 쉽게 만들 수 있습니다.",
  },
];

const workflow = [
  "행사 목록에서 일정, 장소, 대상 직군, 기술 주제, 남은 자리를 확인합니다.",
  "로그인 후 최소 정보로 신청하고, 필요하면 참여 이유를 남깁니다.",
  "운영자는 신청 완료, 대기 신청, 참석 확정, 참석 완료, 취소, 노쇼를 관리합니다.",
  "참석 데이터와 관심 기술 분포를 다음 행사 기획에 반영합니다.",
];

const principles = [
  {
    title: "필요한 정보만 수집",
    description:
      "회원가입, 행사 신청, 공개 프로필 운영에 필요한 정보만 목적별로 나눠 관리합니다.",
  },
  {
    title: "공개는 사용자가 선택",
    description:
      "GitHub, 포트폴리오, 이메일, 네트워킹 가능 여부는 공개 설정한 경우에만 노출합니다.",
  },
  {
    title: "운영 기록을 남김",
    description:
      "관리자 버튼과 주요 API 처리에는 감사로그와 애플리케이션 로그를 남겨 운영 흐름을 추적합니다.",
  },
];

const roadmap = [
  "대기자 자동 승급",
  "행사 후기",
  "관심 기술 기반 행사 추천",
  "이메일 행사 알림",
  "참석자 네트워킹 프로필",
  "신고·차단",
];

const feedbackTypeLabels: Record<string, string> = {
  [communityFeedbackTypes.FEATURE]: "기능",
  [communityFeedbackTypes.BUG]: "버그",
};

const feedbackStatusLabels: Record<string, string> = {
  [communityFeedbackStatuses.OPEN]: "open",
  [communityFeedbackStatuses.REVIEWING]: "reviewing",
  [communityFeedbackStatuses.PLANNED]: "planned",
  [communityFeedbackStatuses.DONE]: "done",
  [communityFeedbackStatuses.CLOSED]: "closed",
};

export default async function AboutPage() {
  const [session, feedbackItems] = await Promise.all([
    getMemberSessionFromCookies(),
    getCommunityFeedbackItems(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "부산 IT 동아리 및 커뮤니티 소개",
    url: `${siteConfig.url}/about`,
    description:
      "부산 IT 동아리 및 커뮤니티의 운영 목적과 행사 중심 커뮤니티 흐름을 소개합니다.",
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return (
    <main className="bg-paper">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />

      <section className="border-b border-blue-100 bg-[#f6faff]">
        <div className="site-container grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:py-16">
          <div>
            <p className="text-sm font-bold text-blue-600">About Busan IT</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold text-ink sm:text-5xl">
              부산에서 IT 사람들을 실제로 연결하는 커뮤니티
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-ink/65">
              부산 IT 동아리 및 커뮤니티는 개발자, 디자이너, 기획자, 학생이
              행사와 스터디를 통해 만나고, 공개 프로필로 서로를 발견할 수 있게
              돕는 지역 기반 서비스입니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                href="/events"
              >
                모임 둘러보기
              </Link>
              <Link
                className="rounded-xl border border-blue-100 bg-white px-6 py-3 text-sm font-bold text-ink transition hover:border-blue-200 hover:bg-blue-50"
                href="/members"
              >
                멤버 보기
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <InfoBand label="핵심 방향" value="행사 탐색 → 신청 → 참석 확인" />
            <InfoBand label="운영 지역" value="부산 전역의 접근 가능한 장소" />
            <InfoBand label="멤버 연결" value="GitHub · 포트폴리오 · 관심 기술" />
          </div>
        </div>
      </section>

      <section className="site-container py-14">
        <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div>
            <p className="text-sm font-bold text-blue-600">Why Events First</p>
            <h2 className="mt-3 text-3xl font-bold text-ink">
              왜 행사 기능을 먼저 만들었나
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink/60">
              지역 커뮤니티의 가치는 게시글 수보다 실제 만남의 반복에서
              만들어집니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {reasons.map((reason) => (
              <article
                className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
                key={reason.title}
              >
                <h3 className="text-xl font-bold text-ink">{reason.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/60">
                  {reason.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-white" id="workflow">
        <div className="site-container grid gap-8 py-14 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <p className="text-sm font-bold text-blue-600">Workflow</p>
            <h2 className="mt-3 text-3xl font-bold text-ink">
              서비스 흐름은 단순하게 유지합니다
            </h2>
            <div className="mt-8 grid gap-3">
              {workflow.map((item, index) => (
                <div
                  className="flex gap-4 rounded-2xl border border-blue-100 bg-paper p-5"
                  key={item}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold leading-6 text-ink/70">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl bg-blue-50 p-6">
            <p className="text-sm font-bold text-blue-700">MVP Scope</p>
            <h3 className="mt-3 text-2xl font-bold text-ink">
              먼저 검증할 기능
            </h3>
            <p className="mt-4 text-sm leading-6 text-ink/60">
              행사 목록·상세, 로그인 신청, 신청 취소, 관리자 행사 생성·수정,
              신청자 관리, 행동 이벤트 수집을 우선합니다.
            </p>
          </aside>
        </div>
      </section>

      <section className="site-container py-14" id="principles">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-blue-600">Principles</p>
          <h2 className="mt-3 text-3xl font-bold text-ink">
            운영과 개인정보 원칙
          </h2>
          <p className="mt-4 text-sm leading-6 text-ink/60">
            커뮤니티가 커질수록 신뢰가 중요해지기 때문에 초기부터 보안과 로그,
            공개 설정을 분리해 둡니다.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {principles.map((principle) => (
            <article
              className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
              key={principle.title}
            >
              <h3 className="text-xl font-bold text-ink">{principle.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/60">
                {principle.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-xl border border-blue-100 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:border-blue-200"
            href="/terms"
          >
            이용약관
          </Link>
          <Link
            className="rounded-xl border border-blue-100 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:border-blue-200"
            href="/privacy"
          >
            개인정보 처리방침
          </Link>
          <Link
            className="rounded-xl border border-blue-100 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:border-blue-200"
            href="/policy"
          >
            운영정책
          </Link>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-white">
        <div className="site-container py-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold text-blue-600">Roadmap</p>
              <h2 className="mt-3 text-3xl font-bold text-ink">
                운영 후 확장할 기능
              </h2>
            </div>
            <Link
              className="text-sm font-bold text-blue-700 transition hover:text-blue-800"
              href="#workflow"
            >
              운영 흐름 보기
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roadmap.map((item) => (
              <div
                className="rounded-2xl border border-blue-100 bg-paper px-5 py-4 text-sm font-bold text-ink/70"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="rounded-2xl border border-blue-100 bg-paper p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-blue-600">
                    Community Requests
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-ink">
                    제안과 버그 제보
                  </h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink/55 ring-1 ring-blue-100">
                  {feedbackItems.length} open items
                </span>
              </div>

              <div className="mt-6 grid gap-3">
                {feedbackItems.length ? (
                  feedbackItems.map((item) => (
                    <article
                      className="rounded-2xl border border-blue-100 bg-white p-5"
                      key={item.id}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-bold",
                            item.type === communityFeedbackTypes.BUG
                              ? "bg-rose-50 text-rose-600"
                              : "bg-blue-50 text-blue-700",
                          ].join(" ")}
                        >
                          {feedbackTypeLabels[item.type]}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-ink/55">
                          {feedbackStatusLabels[item.status]}
                        </span>
                        <span className="text-xs font-bold text-ink/35">
                          #{item.id.slice(0, 8)}
                        </span>
                      </div>
                      <h4 className="mt-3 text-base font-bold text-ink">
                        {item.title}
                      </h4>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">
                        {item.description}
                      </p>
                      <p className="mt-3 text-xs font-semibold text-ink/40">
                        {item.authorName} ·{" "}
                        {item.createdAt.toLocaleDateString("ko-KR")}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-blue-100 bg-white p-6 text-sm leading-6 text-ink/60">
                    아직 등록된 제안이 없습니다. 필요한 기능이나 발견한 문제를
                    먼저 남겨주세요.
                  </div>
                )}
              </div>
            </div>

            <CommunityFeedbackForm
              isLoggedIn={Boolean(session)}
              loginPath="/login?next=/about"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoBand({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold text-blue-600">{label}</p>
      <p className="mt-2 text-base font-bold text-ink">{value}</p>
    </div>
  );
}

async function getCommunityFeedbackItems() {
  try {
    return await db
      .select({
        id: communityFeedback.id,
        type: communityFeedback.type,
        title: communityFeedback.title,
        description: communityFeedback.description,
        status: communityFeedback.status,
        authorName: communityFeedback.authorName,
        createdAt: communityFeedback.createdAt,
      })
      .from(communityFeedback)
      .orderBy(desc(communityFeedback.createdAt))
      .limit(8);
  } catch {
    return [];
  }
}
