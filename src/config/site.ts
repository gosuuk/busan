export const siteConfig = {
  name: "부산 IT 동아리 및 커뮤니티",
  description:
    "부산에서 개발자, 디자이너, 기획자가 함께 공부하고 오프라인 모임을 여는 IT 동아리 및 커뮤니티입니다.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  keywords: [
    "부산 IT 동아리",
    "부산 IT 커뮤니티",
    "부산 개발자 모임",
    "부산 개발자 커뮤니티",
    "부산 오프라인 스터디",
    "부산 사이드프로젝트",
  ],
} as const;
