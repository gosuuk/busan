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

export const applicationLogs = pgTable(
  "application_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    level: varchar("level", { length: 20 }).notNull(),
    message: varchar("message", { length: 300 }).notNull(),
    route: varchar("route", { length: 300 }),
    method: varchar("method", { length: 10 }),
    status: varchar("status", { length: 20 }),
    userId: text("user_id"),
    requestId: varchar("request_id", { length: 120 }),
    metadata: jsonb("metadata").$type<JsonObject>().notNull().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("application_logs_level_time_idx").on(
      table.level,
      table.occurredAt,
    ),
    index("application_logs_route_time_idx").on(
      table.route,
      table.occurredAt,
    ),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: text("actor_user_id"),
    actorRole: varchar("actor_role", { length: 30 }),
    action: varchar("action", { length: 100 }).notNull(),
    targetType: varchar("target_type", { length: 50 }),
    targetId: text("target_id"),
    reason: varchar("reason", { length: 500 }),
    requestId: varchar("request_id", { length: 120 }),
    metadata: jsonb("metadata").$type<JsonObject>().notNull().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_logs_actor_time_idx").on(
      table.actorUserId,
      table.occurredAt,
    ),
    index("audit_logs_action_time_idx").on(table.action, table.occurredAt),
  ],
);

export const securityEvents = pgTable(
  "security_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id"),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    severity: varchar("severity", { length: 20 }).notNull(),
    route: varchar("route", { length: 300 }),
    requestId: varchar("request_id", { length: 120 }),
    metadata: jsonb("metadata").$type<JsonObject>().notNull().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("security_events_type_time_idx").on(
      table.eventType,
      table.occurredAt,
    ),
    index("security_events_user_time_idx").on(table.userId, table.occurredAt),
  ],
);

export const deletionJobs = pgTable(
  "deletion_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    requestedAt: timestamp("requested_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    failureCode: varchar("failure_code", { length: 100 }),
  },
  (table) => [
    index("deletion_jobs_status_requested_idx").on(
      table.status,
      table.requestedAt,
    ),
  ],
);

export const communityFeedbackTypes = {
  FEATURE: "feature",
  BUG: "bug",
} as const;

export type CommunityFeedbackType =
  (typeof communityFeedbackTypes)[keyof typeof communityFeedbackTypes];

export const communityFeedbackStatuses = {
  OPEN: "open",
  REVIEWING: "reviewing",
  PLANNED: "planned",
  DONE: "done",
  CLOSED: "closed",
} as const;

export type CommunityFeedbackStatus =
  (typeof communityFeedbackStatuses)[keyof typeof communityFeedbackStatuses];

export const communityFeedback = pgTable(
  "community_feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: varchar("type", { length: 20 })
      .$type<CommunityFeedbackType>()
      .notNull(),
    title: varchar("title", { length: 140 }).notNull(),
    description: text("description").notNull(),
    status: varchar("status", { length: 20 })
      .$type<CommunityFeedbackStatus>()
      .notNull()
      .default(communityFeedbackStatuses.OPEN),
    authorUserId: text("author_user_id").notNull(),
    authorName: varchar("author_name", { length: 80 }).notNull(),
    metadata: jsonb("metadata").$type<JsonObject>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("community_feedback_status_time_idx").on(
      table.status,
      table.createdAt,
    ),
    index("community_feedback_type_time_idx").on(table.type, table.createdAt),
    index("community_feedback_author_time_idx").on(
      table.authorUserId,
      table.createdAt,
    ),
  ],
);

export const communityFeedbackComments = pgTable(
  "community_feedback_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    feedbackId: uuid("feedback_id").notNull(),
    authorUserId: text("author_user_id").notNull(),
    authorName: varchar("author_name", { length: 80 }).notNull(),
    body: text("body").notNull(),
    previousStatus: varchar("previous_status", { length: 20 }).$type<
      CommunityFeedbackStatus
    >(),
    nextStatus: varchar("next_status", { length: 20 }).$type<
      CommunityFeedbackStatus
    >(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("community_feedback_comments_feedback_time_idx").on(
      table.feedbackId,
      table.createdAt,
    ),
    index("community_feedback_comments_author_time_idx").on(
      table.authorUserId,
      table.createdAt,
    ),
  ],
);
