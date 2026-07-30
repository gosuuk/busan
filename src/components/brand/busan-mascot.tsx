interface BusanMascotProps {
  className?: string;
  mood?: "idle" | "loading";
}

export function BusanMascot({
  className = "h-16 w-16",
  mood = "idle",
}: BusanMascotProps) {
  return (
    <svg
      aria-hidden="true"
      className={[
        className,
        mood === "loading" ? "mascot-bob" : "",
      ].join(" ")}
      fill="none"
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>부산 IT 커뮤니티 마스코트</title>
      <circle cx="48" cy="48" fill="#3182f6" r="36" />
      <path
        className={mood === "loading" ? "mascot-wave" : ""}
        d="M25 31c5-9 13-14 23-14 11 0 19 5 24 14-7-3-14-4-22-1-8 3-16 3-25 1Z"
        fill="#8fd3ff"
      />
      <path
        d="M19 51c6 6 13 9 21 9 11 0 18-7 27-7 5 0 9 1 13 4-4 13-16 23-32 23-17 0-31-12-34-28 2-1 4-1 5-1Z"
        fill="#e8f6ff"
      />
      <circle cx="36" cy="43" fill="#0f172a" r="4" />
      <circle cx="61" cy="43" fill="#0f172a" r="4" />
      <path
        d="M41 56c4 4 10 4 14 0"
        stroke="#0f172a"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <path
        d="M17 46c-7-1-11 2-12 7 7 2 12 0 15-5"
        fill="#8fd3ff"
      />
      <path
        d="M79 46c7-1 11 2 12 7-7 2-12 0-15-5"
        fill="#8fd3ff"
      />
      <circle cx="35" cy="48" fill="#ffffff" opacity="0.55" r="1.5" />
      <circle cx="60" cy="48" fill="#ffffff" opacity="0.55" r="1.5" />
    </svg>
  );
}
