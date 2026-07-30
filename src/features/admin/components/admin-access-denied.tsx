import Link from "next/link";

export function AdminAccessDenied() {
  return (
    <main className="min-h-screen bg-paper">
      <section className="site-container grid min-h-screen place-items-center py-16">
        <div className="max-w-xl rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-bold text-blue-700">
            !
          </span>
          <p className="mt-6 text-sm font-bold text-blue-600">Access denied</p>
          <h1 className="mt-3 text-3xl font-bold text-ink">권한 부족</h1>
          <p className="mt-4 text-sm leading-6 text-ink/60">
            이 페이지는 관리자 권한이 있는 계정만 접근할 수 있습니다. 일반
            회원 계정으로는 관리자 콘솔을 사용할 수 없습니다.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              href="/"
            >
              메인으로 이동
            </Link>
            <Link
              className="rounded-xl border border-blue-100 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:border-blue-200 hover:bg-blue-50"
              href="/events"
            >
              모임 보기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
