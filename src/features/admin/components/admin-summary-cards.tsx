"use client";

import { Card, Col, Row, Statistic } from "antd";

import type { AdminSummaryItem } from "@/features/admin/types";

interface AdminSummaryCardsProps {
  items: AdminSummaryItem[];
}

export function AdminSummaryCards({ items }: AdminSummaryCardsProps) {
  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col key={item.label} lg={6} sm={12} xs={24}>
          <Card variant="outlined" className="h-full shadow-sm">
            <Statistic title={item.label} value={item.value} />
            <p className="mt-2 text-sm text-ink/55">{item.description}</p>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
