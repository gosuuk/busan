"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiRequest, ApiClientError } from "@/lib/api-client";

interface SignupResponse {
  user: {
    role: string;
  };
}

const initialForm = {
  name: "",
  nickname: "",
  phoneNumber: "",
  email: "",
  password: "",
  passwordConfirm: "",
  acceptedRequiredTerms: false,
  acceptedServiceTerms: false,
  acceptedPrivacy: false,
};

interface SignupFormProps {
  nextPath?: string;
}

export function SignupForm({ nextPath }: SignupFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailability, setEmailAvailability] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);

  const isAllAccepted =
    form.acceptedRequiredTerms &&
    form.acceptedServiceTerms &&
    form.acceptedPrivacy;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await apiRequest<SignupResponse>("/api/auth/signup", {
        method: "POST",
        json: form,
      });

      if (response.user.role === "admin") {
        router.push("/admin");
      } else {
        const profilePath = nextPath
          ? `/profile?next=${encodeURIComponent(nextPath)}`
          : "/profile";
        router.push(profilePath);
      }
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setMessage("입력값을 다시 확인해주세요.");
        return;
      }

      setMessage("회원가입을 처리하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(name: keyof typeof form, value: string | boolean) {
    if (name === "email") {
      setEmailAvailability(null);
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateRequiredAgreement(checked: boolean) {
    setForm((current) => ({
      ...current,
      acceptedRequiredTerms: checked,
      acceptedServiceTerms: checked,
      acceptedPrivacy: checked,
    }));
  }

  async function checkEmailAvailability() {
    if (!form.email) {
      setEmailAvailability("이메일을 먼저 입력해주세요.");
      return;
    }

    setIsCheckingEmail(true);
    setEmailAvailability(null);

    try {
      const response = await apiRequest<{ available: boolean }>(
        `/api/auth/email-availability?email=${encodeURIComponent(form.email)}`,
      );

      setEmailAvailability(
        response.available
          ? "사용 가능한 이메일입니다."
          : "이미 가입된 이메일입니다.",
      );
    } catch {
      setEmailAvailability("이메일 확인에 실패했습니다.");
    } finally {
      setIsCheckingEmail(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <FormField label="이름" required>
        <input
          autoComplete="name"
          className="form-input"
          name="name"
          onChange={(event) => updateField("name", event.target.value)}
          required
          value={form.name}
        />
      </FormField>

      <FormField label="닉네임">
        <input
          autoComplete="nickname"
          className="form-input"
          name="nickname"
          onChange={(event) => updateField("nickname", event.target.value)}
          value={form.nickname}
        />
      </FormField>

      <FormField label="휴대폰 번호" required>
        <input
          autoComplete="tel"
          className="form-input"
          name="phoneNumber"
          onChange={(event) => updateField("phoneNumber", event.target.value)}
          placeholder="010-0000-0000"
          required
          value={form.phoneNumber}
        />
      </FormField>

      <FormField label="이메일" required>
        <span className="flex gap-2">
          <input
            autoComplete="email"
            className="form-input"
            name="email"
            onChange={(event) => updateField("email", event.target.value)}
            required
            type="email"
            value={form.email}
          />
          <button
            className="min-h-[50px] shrink-0 rounded-md border border-ink/25 bg-white px-4 text-sm font-semibold text-ink/65 transition hover:border-ink/45 hover:text-ink disabled:cursor-not-allowed disabled:text-ink/35"
            disabled={isCheckingEmail}
            onClick={checkEmailAvailability}
            type="button"
          >
            {isCheckingEmail ? "확인중" : "중복확인"}
          </button>
        </span>
        {emailAvailability ? (
          <span className="mt-2 block text-sm font-medium text-ink/60">
            {emailAvailability}
          </span>
        ) : null}
      </FormField>

      <FormField label="비밀번호" required>
        <input
          autoComplete="new-password"
          className="form-input"
          name="password"
          onChange={(event) => updateField("password", event.target.value)}
          required
          type="password"
          value={form.password}
        />
      </FormField>

      <FormField label="비밀번호 확인" required>
        <input
          autoComplete="new-password"
          className="form-input"
          name="passwordConfirm"
          onChange={(event) =>
            updateField("passwordConfirm", event.target.value)
          }
          required
          type="password"
          value={form.passwordConfirm}
        />
      </FormField>

      <section aria-labelledby="agreement-title" className="pt-2">
        <div className="flex items-center justify-between border-b border-ink/10 pb-3">
          <h2 className="text-lg font-semibold text-ink" id="agreement-title">
            약관 동의
          </h2>
        </div>

        <div className="mt-6 space-y-4">
          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-ink/15 bg-white p-4">
            <input
              checked={isAllAccepted}
              className="h-5 w-5"
              onChange={(event) => updateRequiredAgreement(event.target.checked)}
              type="checkbox"
            />
            <span className="text-sm font-semibold text-ink">
              필수 약관 및 연령 확인에 모두 동의합니다.
            </span>
          </label>

          <AgreementCard
            checked={form.acceptedServiceTerms}
            description="내용을 확인했으며 동의합니다."
            href="/terms"
            onChange={(checked) =>
              updateField("acceptedServiceTerms", checked)
            }
            title="[필수] 부산 IT 동아리 및 커뮤니티 이용약관"
          />

          <AgreementCard
            checked={form.acceptedPrivacy}
            description="내용을 확인했으며 동의합니다."
            href="/privacy"
            onChange={(checked) => updateField("acceptedPrivacy", checked)}
            title="[필수] 개인정보 수집 및 이용 동의"
          />
        </div>
      </section>

      {message ? (
        <p className="rounded-md border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-medium text-coral">
          {message}
        </p>
      ) : null}

      <button
        className="w-full rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/35"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "처리 중" : "회원가입"}
      </button>
    </form>
  );
}

function FormField({
  children,
  label,
  required = false,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">
        {label}
        {required ? <span className="text-coral"> *</span> : null}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function AgreementCard({
  checked,
  description,
  href,
  onChange,
  title,
}: {
  checked: boolean;
  description: string;
  href: string;
  onChange: (checked: boolean) => void;
  title: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-ink/15 bg-white">
      <label className="flex cursor-pointer gap-3 p-4">
        <input
          checked={checked}
          className="mt-0.5 h-5 w-5"
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span>
          <span className="block text-sm font-semibold text-ink">{title}</span>
          <span className="mt-1 block text-sm text-ink/60">{description}</span>
        </span>
      </label>
      <Link
        className="block border-t border-ink/10 bg-paper px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
        href={href}
        target="_blank"
      >
        내용 보기
      </Link>
    </div>
  );
}
