import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "운영정책",
  description: "부산 IT 동아리 및 커뮤니티 운영정책입니다.",
  alternates: {
    canonical: "/policy",
  },
};

const policyItems = [
  "서로를 존중하며 모임과 게시글에서 혐오, 괴롭힘, 광고성 활동을 금지합니다.",
  "오프라인 모임 신청 후 불참이 반복되면 참여가 제한될 수 있습니다.",
  "신고된 게시글과 계정은 운영자가 확인한 뒤 숨김, 경고, 이용 제한을 적용할 수 있습니다.",
  "관리자 작업은 감사로그로 기록되며 보안 이벤트는 별도 테이블에 보관합니다.",
];

export default function PolicyPage() {
  return (
    <main className="bg-paper">
      <article className="site-container max-w-4xl py-12">
        <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold text-blue-600">Community Policy</p>
          <h1 className="mt-3 text-4xl font-bold text-ink">운영정책</h1>
          <ol className="mt-10 grid gap-4">
            {policyItems.map((item, index) => (
              <li
                className="flex gap-4 rounded-2xl bg-paper p-5 text-sm leading-7 text-ink/65"
                key={item}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </article>
    </main>
  );
}
