import Link from "next/link";

const footerLinks = [
  {
    label: "소개",
    href: "/about",
  },
  {
    label: "이용약관",
    href: "/terms",
  },
  {
    label: "개인정보 처리방침",
    href: "/privacy",
  },
  {
    label: "운영정책",
    href: "/policy",
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-blue-100 bg-white">
      <div className="site-container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">
            부산 IT 동아리 및 커뮤니티
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink/60">
            부산에서 개발자, 디자이너, 기획자가 함께 배우고 만나는 커뮤니티입니다.
          </p>
        </div>

        <nav aria-label="하단 메뉴" className="flex flex-wrap gap-x-4 gap-y-2">
          {footerLinks.map((item) => (
            <Link
              className="text-sm font-medium text-ink/60 transition hover:text-ink"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
