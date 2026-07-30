"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiRequest, ApiClientError } from "@/lib/api-client";
import { getPostAuthFallbackPath } from "@/lib/navigation";

interface LoginFormProps {
  nextPath?: string;
}

interface LoginResponse {
  user: {
    role: string;
  };
}

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        json: {
          email,
          password,
        },
      });

      router.push(nextPath ?? getPostAuthFallbackPath(response.user.role));
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setMessage("이메일 또는 비밀번호를 확인해주세요.");
        return;
      }

      setMessage("로그인을 처리하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-semibold text-ink">이메일</span>
        <span className="mt-2 block">
          <input
            autoComplete="email"
            className="form-input"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </span>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-ink">비밀번호</span>
        <span className="mt-2 block">
          <input
            autoComplete="current-password"
            className="form-input"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </span>
      </label>

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
        {isSubmitting ? "처리 중" : "로그인"}
      </button>
    </form>
  );
}
