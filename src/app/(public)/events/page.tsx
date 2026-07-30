import type { Metadata } from "next";
import Link from "next/link";

import { recordProductEvent } from "@/features/analytics/server/record-event";
import { EventsCalendar } from "@/features/events/components/events-calendar";
import { analyticsEvents } from "@/features/events/server/schema";
import {
  getPublishedEventsWithSeats,
  getRecruitingStatus,
  isEventEnded,
} from "@/features/events/server/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "부산 IT 행사",
  description:
    "부산 IT 동아리 및 커뮤니티에서 열리는 개발자, 디자이너, 기획자 오프라인 행사를 확인하세요.",
  alternates: {
    canonical: "/events",
  },
};

export default async function EventsPage() {
  const events = await getPublishedEventsWithSeats();
  const calendarEvents = events.map((event) => ({
    id: event.id,
    isEnded: isEventEnded(event),
    locationName: event.locationName,
    region: event.region,
    slug: event.slug,
    startsAt: event.startsAt.toISOString(),
    title: event.title,
  }));
  const initialCalendarDate =
    events.find((event) => !isEventEnded(event))?.startsAt ??
    events[0]?.startsAt ??
    new Date();
  const initialMonth = `${initialCalendarDate.getFullYear()}-${String(
    initialCalendarDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  await recordProductEvent({
    eventName: analyticsEvents.eventListViewed,
    pagePath: "/events",
    source: "server",
  });

  return (
    <main className="bg-paper">
      <section className="site-container py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-blue-600">Events</p>
          <h1 className="mt-3 text-4xl font-bold text-ink">부산 IT 행사</h1>
          <p className="mt-4 text-base leading-7 text-ink/60">
            부산에서 직접 만나는 개발자, 디자이너, 기획자 모임입니다.
          </p>
        </div>

        <div className="mt-8">
          <EventsCalendar events={calendarEvents} initialMonth={initialMonth} />
        </div>

        <div className="mt-8 grid gap-4">
          {events.length ? (
            events.map((event) => {
              const ended = isEventEnded(event);

              return (
                <Link
                  className={[
                    "rounded-3xl border p-6 shadow-sm transition",
                    ended
                      ? "border-slate-200 bg-slate-100 text-slate-500"
                      : "border-blue-100 bg-white hover:-translate-y-0.5 hover:shadow-md",
                  ].join(" ")}
                  href={`/events/${event.slug}`}
                  key={event.id}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-bold",
                            ended
                              ? "bg-slate-200 text-slate-600"
                              : "bg-blue-50 text-blue-700",
                          ].join(" ")}
                        >
                          {ended ? "완전 종료된 모임" : getRecruitingStatus(event)}
                        </span>
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-bold",
                            ended
                              ? "bg-slate-200 text-slate-500"
                              : "bg-slate-100 text-ink/60",
                          ].join(" ")}
                        >
                          {event.participationFee}
                        </span>
                      </div>
                      <h2
                        className={[
                          "mt-3 text-2xl font-bold",
                          ended ? "text-slate-600" : "text-ink",
                        ].join(" ")}
                      >
                        {event.title}
                      </h2>
                      <p
                        className={[
                          "mt-2 text-sm font-semibold",
                          ended ? "text-slate-500" : "text-ink/60",
                        ].join(" ")}
                      >
                        {event.startsAt.toLocaleString("ko-KR")} · {event.region} ·{" "}
                        {event.locationName}
                      </p>
                      {ended ? (
                        <p className="mt-3 text-sm font-bold text-slate-500">
                          이 모임은 일정이 지나 완전히 종료되었습니다.
                        </p>
                      ) : null}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {event.targetRoles.map((role) => (
                          <span
                            className={[
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              ended
                                ? "bg-slate-200 text-slate-500"
                                : "bg-blue-50 text-blue-700",
                            ].join(" ")}
                            key={role}
                          >
                            {role}
                          </span>
                        ))}
                        {event.techTopics.map((topic) => (
                          <span
                            className={[
                              "rounded-full px-3 py-1 text-xs font-semibold ring-1",
                              ended
                                ? "bg-slate-100 text-slate-500 ring-slate-200"
                                : "bg-white text-ink/55 ring-blue-100",
                            ].join(" ")}
                            key={topic}
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div
                      className={[
                        "shrink-0 rounded-2xl px-5 py-4 text-sm font-bold",
                        ended
                          ? "bg-slate-200 text-slate-600"
                          : "bg-blue-50 text-blue-700",
                      ].join(" ")}
                    >
                      {ended
                        ? "종료"
                        : `정원 ${event.capacity}명 · ${event.remainingSeats}자리 남음`}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="rounded-3xl border border-blue-100 bg-white p-8 text-sm text-ink/60">
              아직 공개된 행사가 없습니다.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
