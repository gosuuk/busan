"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Select, Tag } from "antd";

import type {
  AdminFeedbackCommentRow,
  AdminFeedbackRow,
} from "@/features/admin/types";
import { apiRequest } from "@/lib/api-client";

interface AdminFeedbackBoardProps {
  feedbackItems: AdminFeedbackRow[];
}

const statusOptions = [
  {
    label: "open",
    value: "open",
  },
  {
    label: "진행 중",
    value: "reviewing",
  },
  {
    label: "예정",
    value: "planned",
  },
  {
    label: "완료",
    value: "done",
  },
  {
    label: "닫힘",
    value: "closed",
  },
];

const statusLabels: Record<string, string> = {
  open: "open",
  reviewing: "진행 중",
  planned: "예정",
  done: "완료",
  closed: "닫힘",
};

const typeLabels: Record<string, string> = {
  feature: "기능 제안",
  bug: "버그 제보",
};

export function AdminFeedbackBoard({
  feedbackItems,
}: AdminFeedbackBoardProps) {
  return (
    <div className="grid gap-5">
      {feedbackItems.length ? (
        feedbackItems.map((feedback) => (
          <FeedbackCard feedback={feedback} key={feedback.id} />
        ))
      ) : (
        <Card variant="outlined" className="shadow-sm">
          <p className="text-sm font-semibold text-ink/55">
            아직 등록된 기능 제안이나 버그 제보가 없습니다.
          </p>
        </Card>
      )}
    </div>
  );
}

function FeedbackCard({ feedback }: { feedback: AdminFeedbackRow }) {
  const router = useRouter();
  const [status, setStatus] = useState(feedback.status);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  async function handleStatusChange(nextStatus: string) {
    setStatus(nextStatus);
    setIsSavingStatus(true);

    try {
      await apiRequest(
        `/api/admin/community-feedback/${feedback.id}/status`,
        {
          method: "PATCH",
          json: {
            status: nextStatus,
          },
        },
      );
      router.refresh();
    } finally {
      setIsSavingStatus(false);
    }
  }

  return (
    <Card variant="outlined" className="shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Tag color={feedback.type === "bug" ? "red" : "blue"}>
                {typeLabels[feedback.type] ?? feedback.type}
              </Tag>
              <Tag color={getStatusColor(status)}>
                {statusLabels[status] ?? status}
              </Tag>
              <span className="text-xs font-bold text-ink/35">
                #{feedback.id.slice(0, 8)}
              </span>
              <span className="text-xs font-semibold text-ink/40">
                {feedback.authorName} · {formatDateTime(feedback.createdAt)}
              </span>
            </div>

            <h3 className="mt-3 text-xl font-bold text-ink">
              {feedback.title}
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-ink/60">
              {feedback.description}
            </p>
          </div>

          <div className="shrink-0">
            <p className="mb-2 text-xs font-bold text-ink/45">상태 변경</p>
            <Select
              aria-label="제안 상태"
              disabled={isSavingStatus}
              onChange={handleStatusChange}
              options={statusOptions}
              style={{ minWidth: 140 }}
              value={status}
            />
          </div>
        </div>

        <details className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
          <summary className="cursor-pointer text-sm font-bold text-blue-700">
            운영 코멘트 {feedback.comments.length}개
          </summary>

          <div className="mt-4 grid gap-3">
            {feedback.comments.length ? (
              feedback.comments.map((comment) => (
                <FeedbackComment comment={comment} key={comment.id} />
              ))
            ) : (
              <p className="rounded-xl bg-white px-4 py-3 text-sm text-ink/55">
                아직 운영 코멘트가 없습니다.
              </p>
            )}

            <FeedbackCommentForm feedbackId={feedback.id} />
          </div>
        </details>
      </div>
    </Card>
  );
}

function FeedbackComment({
  comment,
}: {
  comment: AdminFeedbackCommentRow;
}) {
  const isStatusComment = comment.previousStatus || comment.nextStatus;

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-ink">{comment.authorName}</span>
        <span className="text-xs font-semibold text-ink/35">
          {formatDateTime(comment.createdAt)}
        </span>
        {isStatusComment ? (
          <Tag color={getStatusColor(comment.nextStatus ?? "")}>
            {statusLabels[comment.previousStatus ?? ""] ??
              comment.previousStatus ??
              "상태 없음"}{" "}
            → {statusLabels[comment.nextStatus ?? ""] ?? comment.nextStatus}
          </Tag>
        ) : null}
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-ink/65">
        {comment.body}
      </p>
    </article>
  );
}

function FeedbackCommentForm({ feedbackId }: { feedbackId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest(
        `/api/admin/community-feedback/${feedbackId}/comments`,
        {
          method: "POST",
          json: {
            body,
          },
        },
      );
      setBody("");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="rounded-xl bg-white p-4 shadow-sm" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-bold text-ink">운영 코멘트 작성</span>
        <textarea
          className="form-input mt-2 min-h-24 py-3"
          maxLength={1000}
          onChange={(event) => setBody(event.target.value)}
          placeholder="수정 내용, 재현 방법, 처리 결과를 남겨주세요."
          required
          value={body}
        />
      </label>
      <Button
        className="mt-3"
        disabled={isSubmitting || body.trim().length === 0}
        htmlType="submit"
        type="primary"
      >
        {isSubmitting ? "등록 중" : "코멘트 등록"}
      </Button>
    </form>
  );
}

function getStatusColor(status: string): string {
  if (status === "open") return "blue";
  if (status === "reviewing") return "geekblue";
  if (status === "planned") return "purple";
  if (status === "done") return "green";
  if (status === "closed") return "default";
  return "default";
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("ko-KR");
}
