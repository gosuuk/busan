import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  description: "부산 IT 동아리 및 커뮤니티 개인정보 처리방침입니다.",
  alternates: {
    canonical: "/privacy",
  },
};

const privacyItems = [
  {
    title: "수집 항목",
    body: "회원가입 시 이름, 닉네임, 이메일, 휴대폰 번호, 비밀번호 해시, 약관 동의 이력을 수집합니다.",
  },
  {
    title: "이용 목적",
    body: "계정 식별, 커뮤니티 운영, 오프라인 모임 신청 및 관리자 보안 관리를 위해 사용합니다.",
  },
  {
    title: "보관 원칙",
    body: "회원정보, 행동 이벤트, 감사로그는 목적별 테이블로 분리하며 필요한 기간 동안만 보관합니다.",
  },
  {
    title: "안전조치",
    body: "비밀번호는 해시로 저장하고, 관리자 접근은 별도 JWT와 감사로그로 관리합니다.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="bg-paper">
      <article className="site-container max-w-4xl py-12">
        <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold text-blue-600">Privacy</p>
          <h1 className="mt-3 text-4xl font-bold text-ink">
            개인정보 처리방침
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/60">
            부산 IT 동아리 및 커뮤니티는 필요한 개인정보만 수집하고 목적별로
            분리해 관리합니다.
          </p>
          <div className="mt-10 grid gap-5">
            {privacyItems.map((item) => (
              <section className="rounded-2xl bg-paper p-5" key={item.title}>
                <h2 className="text-lg font-bold text-ink">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-ink/65">
                  {item.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
