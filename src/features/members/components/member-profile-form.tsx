"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiRequest, ApiClientError } from "@/lib/api-client";

const jobOptions = [
  "프론트엔드",
  "백엔드",
  "모바일",
  "게임",
  "DevOps",
  "데이터·AI",
  "디자인",
  "기획·PM",
  "학생·취업준비",
];

const careerOptions = [
  "입문",
  "주니어",
  "미들",
  "시니어",
  "리드",
  "학생·취업준비",
];

interface MemberProfileFormProps {
  initialProfile: {
    id?: string;
    nickname: string;
    introduction: string | null;
    jobCategory: string | null;
    experienceRange: string | null;
    githubUrl: string | null;
    portfolioUrl: string | null;
    publicEmail: string | null;
    metadata: {
      interestedTopics: string[];
      activityAreas: string[];
      networkingGoals: string[];
      isOpenToNetworking?: boolean;
    };
    isProfilePublic: boolean;
  };
  nextPath?: string;
}

export function MemberProfileForm({
  initialProfile,
  nextPath,
}: MemberProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    nickname: initialProfile.nickname,
    introduction: initialProfile.introduction ?? "",
    jobCategory: initialProfile.jobCategory ?? "",
    experienceRange: initialProfile.experienceRange ?? "",
    githubUrl: initialProfile.githubUrl ?? "",
    portfolioUrl: initialProfile.portfolioUrl ?? "",
    publicEmail: initialProfile.publicEmail ?? "",
    interestedTopics: initialProfile.metadata.interestedTopics.join(", "),
    activityAreas: initialProfile.metadata.activityAreas.join(", "),
    networkingGoals: initialProfile.metadata.networkingGoals.join(", "),
    isOpenToNetworking: Boolean(initialProfile.metadata.isOpenToNetworking),
    isProfilePublic: initialProfile.isProfilePublic,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await apiRequest("/api/members/profile", {
        method: "PATCH",
        json: {
          ...form,
          interestedTopics: splitTags(form.interestedTopics),
          activityAreas: splitTags(form.activityAreas),
          networkingGoals: splitTags(form.networkingGoals),
        },
      });

      if (nextPath) {
        router.push(nextPath);
      } else {
        setMessage("프로필이 저장되었습니다.");
      }
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setMessage("프로필 입력값을 다시 확인해주세요.");
      } else {
        setMessage("프로필을 저장하지 못했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(name: keyof typeof form, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="닉네임">
          <input
            className="form-input"
            maxLength={30}
            onChange={(event) => updateField("nickname", event.target.value)}
            required
            value={form.nickname}
          />
        </Field>

        <Field label="공개 이메일">
          <input
            className="form-input"
            onChange={(event) => updateField("publicEmail", event.target.value)}
            placeholder="recruit@example.com"
            type="email"
            value={form.publicEmail}
          />
        </Field>

        <Field label="직군">
          <select
            className="form-input"
            onChange={(event) => updateField("jobCategory", event.target.value)}
            value={form.jobCategory}
          >
            <option value="">선택 안 함</option>
            {jobOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="경력">
          <select
            className="form-input"
            onChange={(event) =>
              updateField("experienceRange", event.target.value)
            }
            value={form.experienceRange}
          >
            <option value="">선택 안 함</option>
            {careerOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="한 줄 소개">
        <textarea
          className="form-input min-h-28 py-3"
          maxLength={500}
          onChange={(event) => updateField("introduction", event.target.value)}
          placeholder="부산에서 어떤 일을 하고 어떤 연결을 원하는지 적어주세요."
          value={form.introduction}
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="GitHub">
          <input
            className="form-input"
            onChange={(event) => updateField("githubUrl", event.target.value)}
            placeholder="https://github.com/username"
            type="url"
            value={form.githubUrl}
          />
        </Field>

        <Field label="포트폴리오">
          <input
            className="form-input"
            onChange={(event) => updateField("portfolioUrl", event.target.value)}
            placeholder="https://..."
            type="url"
            value={form.portfolioUrl}
          />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="관심 기술">
          <input
            className="form-input"
            onChange={(event) =>
              updateField("interestedTopics", event.target.value)
            }
            placeholder="Next.js, TypeScript"
            value={form.interestedTopics}
          />
        </Field>

        <Field label="활동 지역">
          <input
            className="form-input"
            onChange={(event) => updateField("activityAreas", event.target.value)}
            placeholder="서면, 센텀, 전포"
            value={form.activityAreas}
          />
        </Field>

        <Field label="참여 목적">
          <input
            className="form-input"
            onChange={(event) =>
              updateField("networkingGoals", event.target.value)
            }
            placeholder="네트워킹, 스터디, 채용"
            value={form.networkingGoals}
          />
        </Field>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-4">
          <input
            checked={form.isOpenToNetworking}
            className="h-5 w-5"
            onChange={(event) =>
              updateField("isOpenToNetworking", event.target.checked)
            }
            type="checkbox"
          />
          <span className="text-sm font-semibold text-ink">
            네트워킹 가능
          </span>
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-4">
          <input
            checked={form.isProfilePublic}
            className="h-5 w-5"
            onChange={(event) =>
              updateField("isProfilePublic", event.target.checked)
            }
            type="checkbox"
          />
          <span className="text-sm font-semibold text-ink">
            멤버 디렉터리에 공개
          </span>
        </label>
      </div>

      {message ? (
        <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "저장 중" : "프로필 저장"}
        </button>
        {initialProfile.id && form.isProfilePublic ? (
          <Link
            className="rounded-xl border border-blue-100 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:border-blue-200"
            href={`/members/${initialProfile.id}`}
          >
            공개 페이지 보기
          </Link>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

function splitTags(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
