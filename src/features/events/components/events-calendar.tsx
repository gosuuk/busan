"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface CalendarEventItem {
  id: string;
  isEnded: boolean;
  locationName: string;
  region: string;
  slug: string;
  startsAt: string;
  title: string;
}

interface EventsCalendarProps {
  events: CalendarEventItem[];
  initialMonth: string;
}

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

export function EventsCalendar({ events, initialMonth }: EventsCalendarProps) {
  const [activeMonth, setActiveMonth] = useState(() => parseMonth(initialMonth));
  const calendarDays = useMemo(() => buildCalendarDays(activeMonth), [activeMonth]);
  const monthEvents = events
    .filter((event) => isSameMonth(new Date(event.startsAt), activeMonth))
    .sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );

  function moveMonth(offset: number) {
    setActiveMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <header className="flex items-center justify-between gap-4 border-b border-blue-100 px-5 py-4">
            <h2 className="text-2xl font-bold text-ink">
              {activeMonth.getFullYear()}년 {activeMonth.getMonth() + 1}월
            </h2>
            <div className="flex gap-2">
              <button
                aria-label="이전 달"
                className="h-10 w-10 rounded-lg border border-blue-100 bg-white text-xl font-bold text-ink transition hover:border-blue-200 hover:bg-blue-50"
                onClick={() => moveMonth(-1)}
                type="button"
              >
                ←
              </button>
              <button
                aria-label="다음 달"
                className="h-10 w-10 rounded-lg border border-blue-100 bg-white text-xl font-bold text-ink transition hover:border-blue-200 hover:bg-blue-50"
                onClick={() => moveMonth(1)}
                type="button"
              >
                →
              </button>
            </div>
          </header>

          <div className="grid grid-cols-7 border-b border-blue-100 bg-blue-50/40 text-center text-xs font-bold text-ink/55">
            {weekdayLabels.map((label, index) => (
              <div
                className={[
                  "border-r border-blue-100 px-2 py-3 last:border-r-0",
                  index === 0 ? "text-red-500" : "",
                  index === 6 ? "text-blue-600" : "",
                ].join(" ")}
                key={label}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const dayEvents = events.filter((event) =>
                isSameDay(new Date(event.startsAt), day.date),
              );

              return (
                <div
                  className={[
                    "min-h-28 border-r border-t border-blue-100 p-2 last:border-r-0",
                    day.isCurrentMonth ? "bg-white" : "bg-slate-50",
                  ].join(" ")}
                  key={day.key}
                >
                  <div
                    className={[
                      "text-xs font-bold",
                      day.isCurrentMonth ? "text-ink/75" : "text-ink/25",
                      day.date.getDay() === 0 ? "text-red-500" : "",
                      day.date.getDay() === 6 ? "text-blue-600" : "",
                    ].join(" ")}
                  >
                    {day.date.getDate()}
                  </div>
                  <div className="mt-2 grid gap-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <Link
                        className={[
                          "truncate rounded-md px-2 py-1 text-xs font-bold ring-1",
                          event.isEnded
                            ? "bg-slate-100 text-slate-500 ring-slate-200"
                            : "bg-blue-50 text-blue-700 ring-blue-100",
                        ].join(" ")}
                        href={`/events/${event.slug}`}
                        key={event.id}
                      >
                        {event.isEnded ? "종료 · " : ""}{event.title}
                      </Link>
                    ))}
                    {dayEvents.length > 3 ? (
                      <span className="text-xs font-semibold text-ink/40">
                        +{dayEvents.length - 3}개
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="border-t border-blue-100 bg-slate-50 p-6 lg:border-l lg:border-t-0">
          <p className="text-xs font-bold uppercase text-blue-600">
            Monthly Schedule
          </p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <h3 className="text-xl font-bold text-ink">이달의 일정</h3>
            <span className="text-sm font-bold text-ink/55">
              {monthEvents.length}개
            </span>
          </div>

          <div className="mt-6 grid gap-5">
            {monthEvents.length ? (
              monthEvents.map((event) => (
                <Link
                  className={[
                    "block border-b pb-5 last:border-b-0",
                    event.isEnded
                      ? "border-slate-200 text-slate-500"
                      : "border-blue-100 text-ink",
                  ].join(" ")}
                  href={`/events/${event.slug}`}
                  key={event.id}
                >
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={[
                        "rounded-md px-2 py-1 text-xs font-bold",
                        event.isEnded
                          ? "bg-slate-200 text-slate-600"
                          : "bg-blue-600 text-white",
                      ].join(" ")}
                    >
                      {event.isEnded ? "완전 종료" : "모집 중"}
                    </span>
                  </div>
                  <h4 className="mt-3 text-base font-bold">{event.title}</h4>
                  <p className="mt-2 text-sm font-semibold">
                    {formatDateTime(event.startsAt)}
                  </p>
                  <p className="mt-3 text-sm">
                    {event.region} · {event.locationName}
                  </p>
                </Link>
              ))
            ) : (
              <p className="rounded-xl bg-white p-4 text-sm text-ink/55">
                이달에 등록된 모임이 없습니다.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function parseMonth(value: string): Date {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function buildCalendarDays(activeMonth: Date) {
  const firstDay = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), 1);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      date,
      isCurrentMonth: date.getMonth() === activeMonth.getMonth(),
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    };
  });
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("ko-KR", {
    dateStyle: "long",
    timeStyle: "short",
  });
}
