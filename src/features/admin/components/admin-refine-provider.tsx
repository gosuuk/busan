"use client";

import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import {
  RefineThemes,
  useNotificationProvider,
} from "@refinedev/antd";
import { App as AntdApp, ConfigProvider } from "antd";

interface AdminRefineProviderProps {
  children: React.ReactNode;
}

export function AdminRefineProvider({
  children,
}: AdminRefineProviderProps) {
  return (
    <ConfigProvider
      theme={{
        ...RefineThemes.Blue,
        token: {
          ...RefineThemes.Blue.token,
          borderRadius: 8,
          colorPrimary: "#3182f6",
          colorText: "#191f28",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
      }}
    >
      <AntdApp>
        <Refine
          notificationProvider={useNotificationProvider}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
          }}
          resources={[
            {
              name: "dashboard",
              list: "/admin",
              meta: {
                label: "대시보드",
              },
            },
            {
              name: "members",
              list: "/admin/members",
              meta: {
                label: "회원",
              },
            },
            {
              name: "events",
              list: "/admin/events",
              create: "/admin/events/new",
              edit: "/admin/events/:id/edit",
              meta: {
                label: "모임",
              },
            },
            {
              name: "applications",
              list: "/admin/applications",
              meta: {
                label: "신청자",
              },
            },
            {
              name: "feedback",
              list: "/admin/feedback",
              meta: {
                label: "제안·버그",
              },
            },
            {
              name: "logs",
              list: "/admin/logs",
              meta: {
                label: "로그",
              },
            },
          ]}
          routerProvider={routerProvider}
        >
          {children}
        </Refine>
      </AntdApp>
    </ConfigProvider>
  );
}
