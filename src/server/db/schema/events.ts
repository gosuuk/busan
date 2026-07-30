import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type { JsonObject } from "../../../types/common";

export const offlineEventStatuses = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CLOSED: "closed",
  CANCELED: "canceled",
} as const;

export type OfflineEventStatus =
  (typeof offlineEventStatuses)[keyof typeof offlineEventStatuses];

export const eventApplicationStatuses = {
  REGISTERED: "registered",
  WAITLISTED: "waitlisted",
  CONFIRMED: "confirmed",
  ATTENDED: "attended",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

export type EventApplicationStatus =
  (typeof eventApplicationStatuses)[keyof typeof eventApplicationStatuses];

export const offlineEvents = pgTable(
  "offline_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    description: text("description").notNull(),
    region: varchar("region", { length: 80 }).notNull().default("부산"),
    locationName: varchar("location_name", { length: 120 }).notNull(),
    address: varchar("address", { length: 300 }),
    targetRoles: jsonb("target_roles")
      .$type<string[]>()
      .notNull()
      .default([]),
    techTopics: jsonb("tech_topics").$type<string[]>().notNull().default([]),
    participationFee: varchar("participation_fee", { length: 80 })
      .notNull()
      .default("무료"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    capacity: integer("capacity").notNull(),
    status: varchar("status", { length: 20 })
      .$type<OfflineEventStatus>()
      .notNull()
      .default(offlineEventStatuses.DRAFT),
    createdByUserId: text("created_by_user_id").notNull(),
    metadata: jsonb("metadata").$type<JsonObject>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("offline_events_status_start_idx").on(table.status, table.startsAt),
    index("offline_events_created_by_idx").on(table.createdByUserId),
  ],
);

export const eventApplications = pgTable(
  "event_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id").notNull(),
    memberId: text("member_id").notNull(),
    participationReason: varchar("participation_reason", { length: 500 }),
    attendanceStatus: varchar("attendance_status", { length: 30 })
      .$type<EventApplicationStatus>()
      .notNull()
      .default(eventApplicationStatuses.REGISTERED),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("event_applications_event_status_idx").on(
      table.eventId,
      table.attendanceStatus,
    ),
    index("event_applications_member_idx").on(table.memberId),
    index("event_applications_event_member_idx").on(
      table.eventId,
      table.memberId,
    ),
  ],
);
