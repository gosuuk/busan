# Busan IT Community

Next.js App Router 기반 부산 IT 커뮤니티 MVP 초기 스캐폴딩입니다.

## Local Setup

```bash
pnpm install
cp .env.example .env.local
# fill .env.local
pnpm dev:db
pnpm env:check
pnpm dev
```

관리자 화면은 Next.js + refine + Ant Design 조합을 사용합니다. 기존 설치에 패키지가 없다면 먼저 아래 의존성을 설치합니다.

```bash
pnpm --store-dir /Users/bt/Library/pnpm/store/v3 install
```

`.env.local`을 만든 뒤 `DATABASE_URL`, `BETTER_AUTH_SECRET`, JWT secret 값을 채운 다음 `pnpm env:check`를 실행합니다. 로컬과 Vercel Preview/Production 환경변수는 각각 분리해서 설정합니다. 운영 DB에는 `db:generate`로 생성된 migration을 검토한 뒤 `db:migrate`로 적용합니다.

로컬 초반 개발에서 바로 필요한 값은 다음입니다.

```bash
DATABASE_URL=postgresql://busan:busan_dev_password@localhost:5432/busan_it_community_dev
BETTER_AUTH_SECRET=local_dev_better_auth_secret_change_me_32_chars
BETTER_AUTH_URL=http://localhost:3000
MEMBER_JWT_SECRET=local_dev_member_jwt_secret_change_me_32_chars
ADMIN_JWT_SECRET=local_dev_admin_jwt_secret_change_me_32_chars
LOCAL_ADMIN_EMAILS=admin@example.com
ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=Admin1234!local
ADMIN_SEED_NAME=관리자
ADMIN_SEED_PHONE=01099990000
CRON_SECRET=local_dev_cron_secret_change_me_32_chars
ANALYTICS_HASH_SECRET=local_dev_analytics_secret_change_me_32_chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`는 소셜 로그인 테스트를 시작할 때 채웁니다. 이메일/비밀번호 로그인만 사용할 경우 비워둘 수 있습니다.

## Local Database

로컬 개발 DB는 Docker PostgreSQL을 사용합니다.

```bash
pnpm dev:db
pnpm db:migrate
pnpm db:seed
```

로컬 기본 연결 문자열은 다음과 같습니다.

```bash
DATABASE_URL=postgresql://busan:busan_dev_password@localhost:5432/busan_it_community_dev
```

Production과 Preview는 Vercel 환경변수에서 Neon PostgreSQL 같은 관리형 DB URL을 별도로 설정합니다.

## Vercel Deployment

GitHub 저장소를 Vercel에 Import해서 배포합니다. 이 프로젝트에는 Vercel용 기본 설정 파일 [vercel.json](./vercel.json)과 환경변수 예시 [.env.vercel.example](./.env.vercel.example)이 포함되어 있습니다.

`gosuuk/busan` 저장소로 올릴 때는 이 프로젝트 전용 GitHub 설정 스크립트를 사용합니다. Mac의 기본 GitHub 계정이나 전역 git 설정은 변경하지 않습니다.

```bash
pnpm github:gosuuk
```

처음 push할 때 인증을 묻는다면 username은 `gosuuk`, password는 `gosuuk` GitHub 계정의 Personal Access Token을 입력합니다. 계정 분리 설정은 [docs/github-gosuuk-setup.md](./docs/github-gosuuk-setup.md)를 참고합니다.

GitHub에 push하면 [CI workflow](./.github/workflows/ci.yml)가 `env:check`, `lint`, `typecheck`, `build`를 실행합니다.

Vercel 배포에는 `BETTER_AUTH_URL`과 `NEXT_PUBLIC_APP_URL`을 배포 도메인으로 설정합니다. Vercel의 자동 URL 환경변수로 fallback되지만, 운영 도메인에서는 직접 지정하는 것을 권장합니다.

운영 DB에는 배포 전에 마이그레이션과 관리자 seed를 적용합니다.

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require" pnpm db:migrate
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require" \
ADMIN_SEED_EMAIL="admin@example.com" \
ADMIN_SEED_PASSWORD="replace_with_12_plus_character_password_123" \
ADMIN_SEED_NAME="관리자" \
ADMIN_SEED_PHONE="01099990000" \
pnpm db:seed
```

자세한 배포 절차는 [docs/deployment-vercel.md](./docs/deployment-vercel.md)를 참고합니다.

## Local Auth

- `/signup`: 일반 회원가입
- `/login`: 이메일/비밀번호 로그인
- `/admin`: 관리자 대시보드
- `/admin/members`: 회원 관리
- `/admin/events`: 모임 목록
- `/admin/events/new`: 모임 생성
- `/admin/events/[eventId]/edit`: 모임 수정
- `/admin/applications`: 신청자·참석자 관리
- `/admin/logs`: 보안/감사/애플리케이션 로그
- `/api/auth/signup`: 회원가입 API
- `/api/auth/login`: 로그인 API
- `/api/auth/me`: 현재 회원 API
- `/api/admin/users`: 관리자 전용 회원 목록 API
- `/api/members/profile`: 회원 프로필 저장 API

로그인 성공 시 일반 회원은 `busan_member_token` 쿠키를 받습니다. DB role이 `admin`인 사용자는 별도 `busan_admin_token` 쿠키도 함께 받습니다. 두 토큰은 서로 다른 secret으로 서명됩니다.

로컬 개발에서는 `LOCAL_ADMIN_EMAILS`에 등록된 이메일로 가입하면 관리자 role이 부여됩니다. 기본 관리자 계정은 아래 명령으로 생성하거나 갱신합니다.

```bash
pnpm db:seed
```

`db:seed`는 `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`, `ADMIN_SEED_NAME`, `ADMIN_SEED_PHONE`을 사용합니다. 운영 환경에서는 자동 승격을 사용하지 말고 DB에서 role을 명시적으로 관리합니다.

관리자 API는 `busan_admin_token` 확인 후 DB에서 현재 role/status를 다시 조회합니다. 인증 전후 rate limit을 적용하고, 실패한 관리자 접근은 `security_events`에 기록합니다.

고객용 화면과 관리자 화면은 App Router route group/layout으로 분리합니다. 고객용 페이지는 공통 헤더/푸터를 사용하고, `/admin` 하위 페이지는 별도 관리자 layout, refine Provider, Ant Design UI를 사용합니다.

관리자 화면의 주요 클릭 컨트롤은 `/api/admin/audit-actions`를 통해 `audit_logs`에 기본 감사로그를 남깁니다. 감사로그 API도 관리자 토큰, DB role/status 재확인, rate limit을 통과해야 기록됩니다.

## Included Baseline

- Next.js App Router + Tailwind 기본 구조
- 관리자 화면용 refine Provider + Ant Design 컴포넌트 구성
- 보안 헤더 `next.config.ts`
- Zod 기반 서버 환경변수 검증
- PostgreSQL + Drizzle 연결
- 일반 회원가입, JWT 로그인, 관리자/회원 토큰 분리
- 회원 프로필, 동의 이력, 분석 이벤트, 감사/보안 로그 DB 스키마
- 애플리케이션 로그 `application_logs`
- 오프라인 모임 `offline_events`와 신청/참석 관리 `event_applications`
- 로그인 사용자 전용 분석 이벤트 수집 API
- JSON 요청 크기/Content-Type 검사, 구조화 로그 마스킹, 간단한 API 클라이언트 유틸

## Public Pages

- `/`: 부산 IT 동아리 및 커뮤니티 소개
- `/events`: 부산 IT 행사 목록
- `/events/[slug]`: 행사 상세와 로그인 후 신청/취소
- `/members`: 공개 멤버 디렉터리
- `/members/[profileId]`: GitHub/포트폴리오 중심 공개 멤버 프로필
- `/profile`: 로그인 회원 프로필 관리
- `/terms`: 이용약관
- `/privacy`: 개인정보 처리방침
- `/policy`: 운영정책
- `/robots.txt`: 검색엔진 크롤링 정책
- `/sitemap.xml`: 공개 페이지 sitemap

고객용 디자인은 연한 파랑 기반의 간결한 톤으로 유지합니다. 운영자용 `/admin`은 고객용 헤더/푸터와 분리된 별도 콘솔 layout을 사용합니다.

## Offline Events

관리자는 `/admin/events/new`에서 오프라인 모임을 생성하고 `/admin/events/[eventId]/edit`에서 수정할 수 있습니다. 생성 API는 `/api/admin/events`, 수정 API는 `/api/admin/events/[eventId]`이며 관리자 토큰, DB role/status 재확인, rate limit을 통과해야 합니다. 생성/수정 성공 시 `audit_logs`와 `application_logs`에 기록됩니다.

사용자는 `/events`에서 공개 행사를 탐색하고 `/events/[slug]`에서 신청합니다. 정원이 남아 있으면 `registered`, 정원이 마감되면 `waitlisted`로 저장됩니다. 모임일자가 지난 행사는 고객 화면에서 `종료된 모임`으로 표시하고 신청 API도 `EVENT_ENDED`로 거절합니다. 본인 신청은 같은 상세 페이지에서 취소할 수 있고, 관리자는 `/admin/applications`에서 신청자 상태를 `registered`, `waitlisted`, `confirmed`, `attended`, `cancelled`, `no_show`로 변경합니다.

`db:seed`는 관리자 계정과 함께 개발용 예시 행사 `Next.js 부산 밋업`을 중복 없이 생성합니다.

행사 퍼널은 `analytics_events`에 다음 이름으로 기록합니다.

- `event_list_viewed`
- `event_detail_viewed`
- `event_apply_clicked`
- `signup_completed`
- `profile_completed`
- `event_registration_completed`
- `event_registration_cancelled`
- `event_attendance_confirmed`

## Member Profiles

회원가입 후 `/profile`에서 닉네임, 직군, 경력, 관심 기술, 활동 지역, GitHub, 포트폴리오, 공개 이메일을 관리합니다. `멤버 디렉터리에 공개`를 켠 프로필만 `/members`와 `/members/[profileId]`에 노출됩니다.

Better Auth의 인증 테이블 migration은 OAuth 환경변수를 채운 뒤 Better Auth/Drizzle 절차에 맞춰 별도로 생성해서 적용합니다. 회원 프로필과 서비스 도메인 테이블은 `src/server/db/schema`에 분리되어 있습니다.
