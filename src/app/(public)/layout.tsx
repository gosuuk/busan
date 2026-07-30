import { SiteFooter } from "@/components/layouts/site-footer";
import { SiteHeader } from "@/components/layouts/site-header";
import { getMemberSessionFromCookies } from "@/server/auth/local/session";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const session = await getMemberSessionFromCookies();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader session={session} />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
