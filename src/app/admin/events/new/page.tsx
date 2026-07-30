import type { Metadata } from "next";

import { AdminEventCreate } from "@/features/admin/components/admin-event-create";

export const metadata: Metadata = {
  title: "관리자 모임 생성",
};

export default function AdminEventCreatePage() {
  return <AdminEventCreate />;
}
