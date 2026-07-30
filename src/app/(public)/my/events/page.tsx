import { and, desc, eq, sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isEventEnded } from "@/features/events/server/queries";
import { getMemberSessionFromCookies } from "@/server/auth/local/session";
import { db } from "@/server/db";
import {
  eventApplications,
  eventApplicationStatuses,
  offlineEvents,
} from "@/server/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "내 일정",
  description: "내가 신청한 부산 IT 모임 일정을 확인합니다.",
  alternates: {
    canonical: "/my/events",
  },
};

const statusLabels: Record<string, string> = {
  registered: "신청 완료",
  waitlisted: "대기 신청",
  confirmed: "참석 확정",
  attended: "참석 완료",
  cancelled: "취소",
  no_show: "노쇼",
};

export default async function MyEventsPage() {
  const session = await getMemberSessionFromCookies();

  if (!session) {
    redirect("/login?next=/my/events");
  }

  const applications = await db
    .select({
      id: eventApplications.id,
      attendanceStatus: eventApplications.attendanceStatus,
      createdAt: eventApplications.createdAt,
      eventId: offlineEvents.id,
      eventTitle: offlineEvents.title,
      eventSlug: offlineEvents.slug,
      eventRegion: offlineEvents.region,
      eventLocationName: offlineEvents.locationName,
      eventStartsAt: offlineEvents.startsAt,
      eventEndsAt: offlineEvents.endsAt,
      eventCapacity: offlineEvents.capacity,
    })
    .from(eventApplications)
    .innerJoin(offlineEvents, eq(eventApplications.eventId, offlineEvents.id))
    .where(
      and(
        eq(eventApplications.memberId, session.user.id),
        sql`${eventApplications.attendanceStatus} <> ${eventApplicationStatuses.CANCELLED}`,
      ),
    )
    .orderBy(desc(offlineEvents.startsAt))
    .limit(50);

  return (
    <main className="bg-paper">
      <section className="site-container py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-blue-600">My Schedule</p>
          <h1 className="mt-3 text-4xl font-bold text-ink">내 일정</h1>
          <p className="mt-4 text-base leading-7 text-ink/60">
            신청했거나 참석 확정된 부산 IT 모임 일정을 확인합니다.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {applications.length ? (
            applications.map((application) => {
              const ended = isEventEnded({
                endsAt: application.eventEndsAt,
                startsAt: application.eventStartsAt,
              });

              return (
                <Link
                  className={[
                    "rounded-3xl border p-6 shadow-sm transition",
                    ended
                      ? "border-slate-200 bg-slate-100 text-slate-500"
                      : "border-blue-100 bg-white hover:-translate-y-0.5 hover:shadow-md",
                  ].join(" ")}
                  href={`/events/${application.eventSlug}`}
                  key={application.id}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-bold",
                            ended
                              ? "bg-slate-200 text-slate-600"
                              : "bg-blue-50 text-blue-700",
                          ].join(" ")}
                        >
                          {ended ? "종료된 모임" : "예정된 모임"}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink/60 ring-1 ring-blue-100">
                          {statusLabels[application.attendanceStatus] ??
                            application.attendanceStatus}
                        </span>
                      </div>
                      <h2
                        className={[
                          "mt-3 text-2xl font-bold",
                          ended ? "text-slate-600" : "text-ink",
                        ].join(" ")}
                      >
                        {application.eventTitle}
                      </h2>
                      <p className="mt-2 text-sm font-semibold text-ink/60">
                        {application.eventStartsAt.toLocaleString("ko-KR")} ·{" "}
                        {application.eventRegion} ·{" "}
                        {application.eventLocationName}
                      </p>
                    </div>
                    <span
                      className={[
                        "rounded-2xl px-5 py-4 text-sm font-bold",
                        ended
                          ? "bg-slate-200 text-slate-600"
                          : "bg-blue-50 text-blue-700",
                      ].join(" ")}
                    >
                      정원 {application.eventCapacity}명
                    </span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="rounded-3xl border border-blue-100 bg-white p-8">
              <p className="text-sm font-semibold text-ink/60">
                아직 신청한 모임이 없습니다.
              </p>
              <Link
                className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                href="/events"
              >
                모임 보러가기
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
