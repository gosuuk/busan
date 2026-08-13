import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { OfflineEventForm } from "@/features/admin/components/offline-event-form";
import { getMemberSessionFromCookies } from "@/server/auth/local/session";

export const metadata: Metadata = {
  title: "행사 등록",
  description: "공모전, 해커톤, 세미나 등 부산 IT 행사를 등록합니다.",
};

export default async function NewEventPage() {
  const session = await getMemberSessionFromCookies();

  if (!session) {
    redirect("/login?next=/events/new");
  }

  return (
    <main className="bg-paper">
      <section className="site-container py-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-bold text-blue-600">Submit an Event</p>
            <h1 className="mt-3 text-4xl font-bold text-ink">행사 등록</h1>
            <p className="mt-4 text-base leading-7 text-ink/60">
              공모전, 해커톤, 세미나, 스터디 정보를 등록해주세요. 회원이
              등록한 행사는 관리자 검토 후 공개됩니다.
            </p>
          </div>
          <Link
            className="text-sm font-bold text-blue-600 hover:text-blue-700"
            href="/my/events"
          >
            내가 등록한 행사 보기 →
          </Link>
        </div>

        <div className="mt-8 max-w-4xl rounded-3xl border border-blue-100 bg-white p-6 shadow-sm md:p-8">
          <OfflineEventForm
            actionPath="/api/events"
            submissionMode="member"
          />
        </div>
      </section>
    </main>
  );
}
