import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type { JsonObject } from "../../../types/common";

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id"),
    sessionId: uuid("session_id"),
    eventName: varchar("event_name", { length: 100 }).notNull(),
    eventVersion: varchar("event_version", { length: 10 }).notNull(),
    pagePath: varchar("page_path", { length: 300 }),
    referrerDomain: varchar("referrer_domain", { length: 200 }),
    entityType: varchar("entity_type", { length: 30 }),
    entityId: uuid("entity_id"),
    properties: jsonb("properties").$type<JsonObject>().notNull().default({}),
    source: varchar("source", { length: 20 }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("analytics_events_name_time_idx").on(
      table.eventName,
      table.occurredAt,
    ),
    index("analytics_events_user_time_idx").on(
      table.userId,
      table.occurredAt,
    ),
  ],
);
