"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Select } from "antd";

import { apiRequest } from "@/lib/api-client";

const statusOptions = [
  {
    value: "registered",
    label: "신청 완료",
  },
  {
    value: "waitlisted",
    label: "대기 신청",
  },
  {
    value: "confirmed",
    label: "참석 확정",
  },
  {
    value: "attended",
    label: "참석 완료",
  },
  {
    value: "cancelled",
    label: "취소",
  },
  {
    value: "no_show",
    label: "노쇼",
  },
];

interface ApplicationStatusSelectProps {
  applicationId: string;
  value: string;
}

export function ApplicationStatusSelect({
  applicationId,
  value,
}: ApplicationStatusSelectProps) {
  const router = useRouter();
  const [currentValue, setCurrentValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange(nextValue: string) {
    setCurrentValue(nextValue);
    setIsSaving(true);

    try {
      await apiRequest(`/api/admin/event-applications/${applicationId}/status`, {
        method: "PATCH",
        json: {
          attendanceStatus: nextValue,
        },
      });
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Select
      aria-label="참석 상태"
      disabled={isSaving}
      onChange={handleChange}
      options={statusOptions}
      style={{
        minWidth: 128,
      }}
      value={currentValue}
    />
  );
}
