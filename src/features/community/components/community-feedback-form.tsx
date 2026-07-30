"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiRequest, ApiClientError } from "@/lib/api-client";

interface CommunityFeedbackFormProps {
  isLoggedIn: boolean;
  loginPath: string;
}

const feedbackTypeOptions = [
  {
    label: "기능 제안",
    value: "feature",
  },
  {
    label: "버그 제보",
    value: "bug",
  },
];

export function CommunityFeedbackForm({
  isLoggedIn,
  loginPath,
}: CommunityFeedbackFormProps) {
  const router = useRouter();
  const [type, setType] = useState("feature");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLoggedIn) {
      setMessage("로그인 후 제안이나 버그 제보를 남길 수 있습니다.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await apiRequest("/api/community/feedback", {
        method: "POST",
        json: {
          type,
          title,
          description,
        },
      });
      setTitle("");
      setDescription("");
      setType("feature");
      setMessage("등록되었습니다. 운영자가 확인 후 상태를 업데이트합니다.");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        setMessage("로그인 후 등록할 수 있습니다.");
      } else if (error instanceof ApiClientError && error.status === 429) {
        setMessage("잠시 후 다시 시도해주세요.");
      } else {
        setMessage("등록하지 못했습니다. 입력 내용을 다시 확인해주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-blue-600">새 제안 작성</p>
        <h3 className="mt-3 text-2xl font-bold text-ink">
          로그인 후 참여할 수 있습니다
        </h3>
        <p className="mt-3 text-sm leading-6 text-ink/60">
          기능 제안과 버그 제보는 작성자를 확인할 수 있도록 로그인한 회원만
          등록합니다.
        </p>
        <Link
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          href={loginPath}
        >
          로그인하고 작성하기
        </Link>
      </div>
    );
  }

  return (
    <form
      className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <p className="text-sm font-bold text-blue-600">새 제안 작성</p>
      <h3 className="mt-3 text-2xl font-bold text-ink">
        기능 제안 또는 버그 제보
      </h3>

      <div className="mt-6 grid gap-4">
        <label className="block">
          <span className="text-sm font-bold text-ink">유형</span>
          <select
            className="form-input mt-2"
            onChange={(event) => setType(event.target.value)}
            value={type}
          >
            {feedbackTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-ink">제목</span>
          <input
            className="form-input mt-2"
            maxLength={140}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="예: 관심 기술별 모임 필터가 필요해요"
            required
            value={title}
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-ink">내용</span>
          <textarea
            className="form-input mt-2 min-h-32 py-3"
            maxLength={2000}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="문제 상황, 기대 동작, 제안 이유를 적어주세요."
            required
            value={description}
          />
        </label>
      </div>

      {message ? (
        <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
          {message}
        </p>
      ) : null}

      <button
        className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "등록 중" : "제안 등록"}
      </button>
    </form>
  );
}
