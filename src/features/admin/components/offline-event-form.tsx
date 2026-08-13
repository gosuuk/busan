"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiRequest, ApiClientError } from "@/lib/api-client";
import { eventCategoryLabels } from "@/features/events/server/schema";

const initialForm = {
  title: "",
  category: "hackathon",
  description: "",
  region: "서면",
  locationName: "",
  address: "",
  targetRoles: "프론트엔드, 백엔드",
  techTopics: "Next.js, TypeScript",
  participationFee: "무료",
  startsAt: "",
  endsAt: "",
  capacity: "30",
  status: "draft",
};

type OfflineEventFormState = typeof initialForm;

interface OfflineEventFormProps {
  actionPath?: string;
  initialValues?: Partial<OfflineEventFormState>;
  mode?: "create" | "edit";
  submissionMode?: "admin" | "member";
}

export function OfflineEventForm({
  actionPath = "/api/admin/events",
  initialValues,
  mode = "create",
  submissionMode = "admin",
}: OfflineEventFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<OfflineEventFormState>(() => ({
    ...initialForm,
    ...initialValues,
  }));
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = mode === "edit";
  const isMemberSubmission = submissionMode === "member";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!isMemberSubmission) {
        await fetch("/api/admin/audit-actions", {
          body: JSON.stringify({
            action: isEditMode
              ? "admin_offline_event_updated"
              : "admin_event_form_submitted",
            targetType: "offline_event",
            metadata: {
              title: form.title,
            },
          }),
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
      }

      await apiRequest(actionPath, {
        method: isEditMode ? "PATCH" : "POST",
        json: {
          ...form,
          targetRoles: splitTags(form.targetRoles),
          techTopics: splitTags(form.techTopics),
          startsAt: toIsoDateTime(form.startsAt),
          endsAt: form.endsAt ? toIsoDateTime(form.endsAt) : undefined,
          capacity: Number.parseInt(form.capacity, 10),
        },
      });

      if (!isEditMode) {
        setForm(initialForm);
      }
      setMessage(
        isMemberSubmission
          ? "행사가 등록되었습니다. 관리자 검토 후 공개됩니다."
          : isEditMode
          ? "오프라인 모임이 수정되었습니다."
          : "오프라인 모임이 생성되었습니다.",
      );
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setMessage(getApiErrorMessage(error));
      } else {
        setMessage("모임을 생성하지 못했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-semibold text-ink">모임명</span>
        <input
          className="form-input mt-2"
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="부산 프론트엔드 네트워킹"
          required
          value={form.title}
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-ink">행사 카테고리</span>
        <select
          className="form-input mt-2"
          onChange={(event) => updateField("category", event.target.value)}
          value={form.category}
        >
          {Object.entries(eventCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-ink">소개</span>
        <textarea
          className="form-input mt-2 min-h-28 py-3"
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="모임 주제와 참가 대상을 입력하세요."
          required
          value={form.description}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-ink">부산 지역</span>
          <input
            className="form-input mt-2"
            onChange={(event) => updateField("region", event.target.value)}
            placeholder="서면"
            required
            value={form.region}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">장소명</span>
          <input
            className="form-input mt-2"
            onChange={(event) => updateField("locationName", event.target.value)}
            placeholder="부산창업카페"
            required
            value={form.locationName}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">정원</span>
          <input
            className="form-input mt-2"
            min={1}
            max={300}
            onChange={(event) => updateField("capacity", event.target.value)}
            required
            type="number"
            value={form.capacity}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-ink">주소</span>
        <input
          className="form-input mt-2"
          onChange={(event) => updateField("address", event.target.value)}
          placeholder="부산광역시 ..."
          value={form.address}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-ink">대상 직군</span>
          <input
            className="form-input mt-2"
            onChange={(event) => updateField("targetRoles", event.target.value)}
            placeholder="프론트엔드, 백엔드"
            value={form.targetRoles}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">기술 주제</span>
          <input
            className="form-input mt-2"
            onChange={(event) => updateField("techTopics", event.target.value)}
            placeholder="Next.js, TypeScript"
            value={form.techTopics}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-ink">참가비</span>
        <input
          className="form-input mt-2"
          onChange={(event) => updateField("participationFee", event.target.value)}
          placeholder="무료"
          required
          value={form.participationFee}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-ink">시작 시간</span>
          <input
            className="form-input mt-2"
            onChange={(event) => updateField("startsAt", event.target.value)}
            required
            type="datetime-local"
            value={form.startsAt}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">종료 시간</span>
          <input
            className="form-input mt-2"
            onChange={(event) => updateField("endsAt", event.target.value)}
            type="datetime-local"
            value={form.endsAt}
          />
        </label>
      </div>

      {!isMemberSubmission ? (
        <label className="block">
          <span className="text-sm font-semibold text-ink">상태</span>
          <select
            className="form-input mt-2"
            onChange={(event) => updateField("status", event.target.value)}
            value={form.status}
          >
            <option value="draft">임시저장</option>
            <option value="pending">검토 대기</option>
            <option value="published">공개</option>
            <option value="closed">종료</option>
            <option value="canceled">취소</option>
            <option value="rejected">반려</option>
          </select>
        </label>
      ) : null}

      {message ? (
        <p className="whitespace-pre-line rounded-md bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          {message}
        </p>
      ) : null}

      <button
        className="rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting
          ? isEditMode
            ? "수정 중"
            : isMemberSubmission
              ? "등록 중"
              : "생성 중"
          : isEditMode
            ? "모임 수정"
            : isMemberSubmission
              ? "검토 요청하기"
              : "모임 생성"}
      </button>
    </form>
  );
}

function toIsoDateTime(value: string): string {
  return new Date(value).toISOString();
}

function splitTags(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getApiErrorMessage(error: ApiClientError): string {
  if (!isErrorPayload(error.payload)) {
    return "모임 정보를 다시 확인해주세요.";
  }

  if (Array.isArray(error.payload.details)) {
    const detailMessages = error.payload.details
      .map((detail) => {
        if (!isErrorDetail(detail)) return null;
        return detail.field
          ? `${fieldLabels[detail.field] ?? detail.field}: ${detail.message}`
          : detail.message;
      })
      .filter(Boolean);

    if (detailMessages.length > 0) {
      return detailMessages.join("\n");
    }
  }

  return error.payload.message;
}

function isErrorPayload(value: unknown): value is {
  details?: unknown;
  message: string;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  );
}

function isErrorDetail(value: unknown): value is {
  field?: string;
  message: string;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string" &&
    (!("field" in value) || typeof value.field === "string")
  );
}

const fieldLabels: Record<string, string> = {
  title: "모임명",
  category: "행사 카테고리",
  description: "소개",
  region: "부산 지역",
  locationName: "장소명",
  address: "주소",
  targetRoles: "대상 직군",
  techTopics: "기술 주제",
  participationFee: "참가비",
  startsAt: "시작 시간",
  endsAt: "종료 시간",
  capacity: "정원",
  status: "상태",
};
