import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "부산 IT 동아리 및 커뮤니티 서비스 이용약관입니다.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <PolicyDocument
      description="커뮤니티 가입, 게시글 작성, 오프라인 모임 참여에 적용되는 기본 약관입니다."
      title="이용약관"
    >
      <Section title="서비스 목적">
        부산 IT 동아리 및 커뮤니티는 부산 지역 IT 구성원의 학습, 교류,
        오프라인 모임 운영을 지원합니다.
      </Section>
      <Section title="회원의 의무">
        회원은 타인의 권리를 침해하거나 커뮤니티 운영을 방해하는 행위를 하지
        않아야 하며, 모임 신청 정보는 정확하게 입력해야 합니다.
      </Section>
      <Section title="서비스 제한">
        운영자는 신고, 보안 위험, 약관 위반이 확인된 계정의 이용을 제한할 수
        있습니다.
      </Section>
    </PolicyDocument>
  );
}

function PolicyDocument({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main className="bg-paper">
      <article className="site-container max-w-4xl py-12">
        <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold text-blue-600">Policy</p>
          <h1 className="mt-3 text-4xl font-bold text-ink">{title}</h1>
          <p className="mt-4 text-base leading-7 text-ink/60">{description}</p>
          <div className="mt-10 grid gap-8">{children}</div>
        </div>
      </article>
    </main>
  );
}

function Section({ children, title }: { children: string; title: string }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-ink/65">{children}</p>
    </section>
  );
}
