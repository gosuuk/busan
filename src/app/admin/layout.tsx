import { AntdRegistry } from "@ant-design/nextjs-registry";
import { redirect } from "next/navigation";

import { AdminAccessDenied } from "@/features/admin/components/admin-access-denied";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { AdminRefineProvider } from "@/features/admin/components/admin-refine-provider";
import {
  getAdminSessionFromCookies,
  getMemberSessionFromCookies,
} from "@/server/auth/local/session";

import "@refinedev/antd/dist/reset.css";

export const dynamic = "force-dynamic";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const [session, memberSession] = await Promise.all([
    getAdminSessionFromCookies(),
    getMemberSessionFromCookies(),
  ]);

  if (!session) {
    if (memberSession) {
      return <AdminAccessDenied />;
    }

    redirect("/login?next=/admin");
  }

  return (
    <AntdRegistry>
      <AdminRefineProvider>
        <AdminShell
          currentAdmin={{
            email: session.user.email,
            name: session.user.name,
          }}
        >
          {children}
        </AdminShell>
      </AdminRefineProvider>
    </AntdRegistry>
  );
}
