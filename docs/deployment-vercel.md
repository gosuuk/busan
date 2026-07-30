# Vercel Deployment

이 프로젝트는 GitHub 저장소를 Vercel에 Import해서 배포하는 흐름을 기준으로 합니다.

## 1. GitHub에 올리기

이 기기의 기본 GitHub 계정과 별개로 이 프로젝트만 `gosuuk/busan`에 올립니다. 먼저 [github-gosuuk-setup.md](./github-gosuuk-setup.md)의 계정 분리 설정을 확인합니다.

```bash
cd /Users/bt/Desktop/busan
pnpm github:gosuuk
```

직접 실행하려면 아래 명령을 사용합니다.

```bash
git init
git branch -M main
git add -A
git commit -m "Initial Busan IT community setup"
git remote add origin git@github.com-gosuuk:gosuuk/busan.git 2>/dev/null || git remote set-url origin git@github.com-gosuuk:gosuuk/busan.git
git push -u origin main
```

GitHub 저장소에 push하면 `.github/workflows/ci.yml`이 `env:check`, `lint`, `typecheck`, `build`를 실행합니다.

## 2. Production DB 준비

Vercel Postgres, Neon, Supabase 같은 관리형 PostgreSQL을 하나 만들고 `DATABASE_URL`을 준비합니다.

운영 DB에는 마이그레이션을 먼저 적용합니다.

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require" pnpm db:migrate
```

관리자 계정은 운영 DB에 한 번 seed합니다.

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require" \
ADMIN_SEED_EMAIL="admin@example.com" \
ADMIN_SEED_PASSWORD="replace_with_12_plus_character_password_123" \
ADMIN_SEED_NAME="관리자" \
ADMIN_SEED_PHONE="01099990000" \
pnpm db:seed
```

## 3. Vercel 환경변수

Vercel Project Settings의 Environment Variables에 `.env.vercel.example` 값을 기준으로 입력합니다.

필수값:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `MEMBER_JWT_SECRET`
- `ADMIN_JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`

관리자 seed용 값:

- `ADMIN_SEED_EMAIL`
- `ADMIN_SEED_PASSWORD`
- `ADMIN_SEED_NAME`
- `ADMIN_SEED_PHONE`

선택값:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `CRON_SECRET`
- `ANALYTICS_HASH_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`

`BETTER_AUTH_URL`과 `NEXT_PUBLIC_APP_URL`은 배포 도메인과 일치시킵니다. Vercel의 `VERCEL_URL`로 자동 보정되지만, 운영 도메인이 확정되면 두 값을 직접 넣는 편이 가장 안전합니다.

Vercel Postgres나 Neon 연동에서 `POSTGRES_URL` 또는 `POSTGRES_PRISMA_URL`만 자동 생성된 경우 앱은 이를 `DATABASE_URL` fallback으로 사용할 수 있습니다. 그래도 운영에서는 `DATABASE_URL`을 명시해 두면 마이그레이션, seed, 앱 런타임 설정을 동일하게 맞추기 쉽습니다.

## 4. Vercel Import

1. Vercel에서 `Add New Project`를 선택합니다.
2. GitHub 저장소를 Import합니다.
3. Framework Preset은 `Next.js`를 사용합니다.
4. Install Command는 `pnpm install --frozen-lockfile`입니다.
5. Build Command는 `pnpm build`입니다.
6. 환경변수를 입력한 뒤 Deploy합니다.

## 5. 배포 후 확인

확인할 경로:

- `/`
- `/events`
- `/members`
- `/login`
- `/admin`
- `/about`

일반 회원으로 `/admin`에 접근하면 `권한 부족` 화면이 나와야 합니다. 관리자 계정은 `pnpm db:seed`로 생성한 계정으로 로그인합니다.
