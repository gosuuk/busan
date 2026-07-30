import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { recordProductEvent } from "@/features/analytics/server/record-event";
import { EventApplyForm } from "@/features/events/components/event-apply-form";
import { getMemberSessionFromCookies } from "@/server/auth/local/session";
import { analyticsEvents } from "@/features/events/server/schema";
import {
  getEventApplicationForMember,
  getPublishedEventBySlug,
  getRecruitingStatus,
  isEventEnded,
} from "@/features/events/server/queries";

interface EventDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);

  if (!event) {
    return {
      title: "행사 없음",
    };
  }

  return {
    title: event.title,
    description: `${event.region} ${event.locationName}에서 열리는 부산 IT 행사입니다.`,
    alternates: {
      canonical: `/events/${event.slug}`,
    },
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const session = await getMemberSessionFromCookies();
  const eventEnded = isEventEnded(event);
  const currentApplication = session
    ? await getEventApplicationForMember(event.id, session.user.id)
    : null;

  await recordProductEvent({
    eventName: analyticsEvents.eventDetailViewed,
    pagePath: `/events/${event.slug}`,
    entityType: "event",
    entityId: event.id,
    source: "server",
    userId: session?.user.id,
  });

  return (
    <main className="bg-paper">
      <article className="site-container grid gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section
          className={[
            "rounded-3xl border p-8 shadow-sm",
            eventEnded
              ? "border-slate-200 bg-slate-100"
              : "border-blue-100 bg-white",
          ].join(" ")}
        >
          <div className="flex flex-wrap gap-2">
            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-bold",
                eventEnded
                  ? "bg-slate-200 text-slate-600"
                  : "bg-blue-50 text-blue-700",
              ].join(" ")}
            >
              {getRecruitingStatus(event)}
            </span>
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-ink/60">
              {event.participationFee}
            </span>
          </div>
          <h1
            className={[
              "mt-5 text-4xl font-bold",
              eventEnded ? "text-slate-600" : "text-ink",
            ].join(" ")}
          >
            {event.title}
          </h1>
          {eventEnded ? (
            <p className="mt-4 rounded-2xl bg-slate-200 px-5 py-4 text-sm font-bold text-slate-600">
              이 모임은 일정이 지나 완전히 종료되었습니다.
            </p>
          ) : null}
          <p className="mt-5 whitespace-pre-line text-base leading-8 text-ink/65">
            {event.description}
          </p>

          <dl className="mt-8 grid gap-4 md:grid-cols-2">
            <Info label="일시" value={event.startsAt.toLocaleString("ko-KR")} />
            <Info label="장소" value={`${event.region} · ${event.locationName}`} />
            <Info label="주소" value={event.address ?? "추후 안내"} />
            <Info
              label="정원"
              value={`${event.capacity}명 · ${event.remainingSeats}자리 남음`}
            />
          </dl>

          <div className="mt-8 flex flex-wrap gap-2">
            {event.targetRoles.map((role) => (
              <span
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                key={role}
              >
                {role}
              </span>
            ))}
            {event.techTopics.map((topic) => (
              <span
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink/55 ring-1 ring-blue-100"
                key={topic}
              >
                {topic}
              </span>
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-ink">행사 신청</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            {eventEnded
              ? "모임일자가 지나 신청을 받지 않습니다."
              : "신청 항목은 최소화했습니다. 로그인 후 바로 신청할 수 있습니다."}
          </p>
          <div className="mt-6">
            <EventApplyForm
              currentApplicationStatus={
                currentApplication?.attendanceStatus ?? null
              }
              eventId={event.id}
              isEventEnded={eventEnded}
              isLoggedIn={Boolean(session)}
              loginPath={`/login?next=/events/${event.slug}`}
            />
          </div>
        </aside>
      </article>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-blue-50 p-4">
      <dt className="text-xs font-bold text-blue-700">{label}</dt>
      <dd className="mt-2 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
