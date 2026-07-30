"use client";

import type { MouseEvent } from "react";

interface AdminAuditLinkProps {
  action: "admin_nav_clicked" | "admin_api_users_opened" | "admin_users_refresh_clicked";
  children: React.ReactNode;
  className: string;
  href: string;
  metadata?: Record<string, string | number | boolean | null>;
  targetType?: string;
}

export function AdminAuditLink({
  action,
  children,
  className,
  href,
  metadata,
  targetType,
}: AdminAuditLinkProps) {
  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    try {
      await fetch("/api/admin/audit-actions", {
        body: JSON.stringify({
          action,
          metadata,
          targetType,
        }),
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
    } finally {
      if (href === "#") return;
      window.location.assign(href);
    }
  }

  return (
    <a className={className} href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
