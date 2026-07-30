"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiRequest, ApiClientError } from "@/lib/api-client";

interface EventApplyFormProps {
  currentApplicationStatus: string | null;
  eventId: string;
  isEventEnded: boolean;
  isLoggedIn: boolean;
  loginPath: string;
  unavailableMessage?: string | null;
}

const statusLabels: Record<string, string> = {
  registered: "신청 완료",
  waitlisted: "대기 신청",
  confirmed: "참석 확정",
  attended: "참석 완료",
  cancelled: "취소",
  no_show: "노쇼",
};

export function EventApplyForm({
  currentApplicationStatus,
  eventId,
  isEventEnded,
  isLoggedIn,
  loginPath,
  unavailableMessage,
}: EventApplyFormProps) {
  const router = useRouter();
  const [participationReason, setParticipationReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-sm font-semibold text-ink">
          {isEventEnded
            ? unavailableMessage ?? "종료된 모임입니다."
            : "로그인한 회원만 행사 신청을 할 수 있습니다."}
        </p>
        {!isEventEnded ? (
          <Link
            className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            href={loginPath}
          >
            로그인하고 신청하기
          </Link>
        ) : null}
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await apiRequest<{ application: { attendanceStatus: string } }>(
        `/api/events/${eventId}/apply`,
        {
          method: "POST",
          json: {
            participationReason,
          },
        },
      );

      setMessage(
        response.application.attendanceStatus === "waitlisted"
          ? "정원이 마감되어 대기 신청되었습니다."
          : "행사 신청이 완료되었습니다.",
      );
      setParticipationReason("");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setMessage("이미 신청했거나 신청할 수 없는 행사입니다.");
      } else {
        setMessage("행사 신청을 처리하지 못했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel() {
    setIsCancelling(true);
    setMessage(null);

    try {
      await apiRequest(`/api/events/${eventId}/apply`, {
        method: "DELETE",
      });
      setMessage("행사 신청이 취소되었습니다.");
      router.refresh();
    } catch {
      setMessage("신청 취소를 처리하지 못했습니다.");
    } finally {
      setIsCancelling(false);
    }
  }

  if (currentApplicationStatus) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-sm font-semibold text-ink">
          현재 상태: {statusLabels[currentApplicationStatus] ?? currentApplicationStatus}
        </p>
        {isEventEnded ? (
          <p className="mt-2 text-sm font-semibold text-blue-700">
            {unavailableMessage ?? "종료된 모임입니다."}
          </p>
        ) : null}

        {message ? (
          <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-blue-700">
            {message}
          </p>
        ) : null}

        <button
          className="mt-4 rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:border-blue-300 disabled:cursor-not-allowed disabled:text-ink/35"
          disabled={
            isCancelling ||
            isEventEnded ||
            currentApplicationStatus === "attended"
          }
          onClick={handleCancel}
          type="button"
        >
          {isCancelling ? "취소 중" : "신청 취소"}
        </button>
      </div>
    );
  }

  if (isEventEnded) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-sm font-semibold text-ink">
          {unavailableMessage ?? "종료된 모임입니다."}
        </p>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-semibold text-ink">참가 목적</span>
        <textarea
          className="form-input mt-2 min-h-28 py-3"
          onChange={(event) => setParticipationReason(event.target.value)}
          placeholder="궁금한 점이나 참가 목적을 짧게 남겨주세요."
          value={participationReason}
        />
      </label>

      {message ? (
        <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          {message}
        </p>
      ) : null}

      <button
        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "신청 중" : "행사 신청"}
      </button>
    </form>
  );
}
