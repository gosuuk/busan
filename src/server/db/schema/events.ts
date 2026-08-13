import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type { JsonObject } from "../../../types/common";

export const offlineEventStatuses = {
  DRAFT: "draft",
  PENDING: "pending",
  PUBLISHED: "published",
  CLOSED: "closed",
  CANCELED: "canceled",
  REJECTED: "rejected",
} as const;

export type OfflineEventStatus =
  (typeof offlineEventStatuses)[keyof typeof offlineEventStatuses];

export const eventCategories = {
  CONTEST: "contest",
  HACKATHON: "hackathon",
  MEETUP: "meetup",
  SEMINAR: "seminar",
  STUDY: "study",
  OTHER: "other",
} as const;

export type EventCategory =
  (typeof eventCategories)[keyof typeof eventCategories];

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
    category: varchar("category", { length: 30 })
      .$type<EventCategory>()
      .notNull()
      .default(eventCategories.MEETUP),
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
    index("offline_events_category_status_idx").on(table.category, table.status),
    index("offline_events_created_by_idx").on(table.createdByUserId),
  ],
);

export const teamRoomStatuses = {
  RECRUITING: "recruiting",
  FULL: "full",
  CLOSED: "closed",
} as const;

export type TeamRoomStatus =
  (typeof teamRoomStatuses)[keyof typeof teamRoomStatuses];

export const teamRecruitmentRooms = pgTable(
  "team_recruitment_rooms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => offlineEvents.id, { onDelete: "cascade" }),
    leaderId: text("leader_id").notNull(),
    title: varchar("title", { length: 100 }).notNull(),
    description: text("description").notNull(),
    neededRoles: jsonb("needed_roles").$type<string[]>().notNull().default([]),
    capacity: integer("capacity").notNull(),
    contact: varchar("contact", { length: 300 }),
    status: varchar("status", { length: 20 })
      .$type<TeamRoomStatus>()
      .notNull()
      .default(teamRoomStatuses.RECRUITING),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("team_rooms_event_leader_unique_idx").on(
      table.eventId,
      table.leaderId,
    ),
    index("team_rooms_event_status_idx").on(table.eventId, table.status),
    index("team_rooms_leader_idx").on(table.leaderId),
  ],
);

export const teamApplicationStatuses = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export type TeamApplicationStatus =
  (typeof teamApplicationStatuses)[keyof typeof teamApplicationStatuses];

export const teamRoomApplications = pgTable(
  "team_room_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => teamRecruitmentRooms.id, { onDelete: "cascade" }),
    memberId: text("member_id").notNull(),
    message: varchar("message", { length: 500 }),
    disclosureConsentVersion: varchar("disclosure_consent_version", {
      length: 30,
    }),
    disclosureConsentGrantedAt: timestamp("disclosure_consent_granted_at", {
      withTimezone: true,
    }),
    disclosureConsentWithdrawnAt: timestamp("disclosure_consent_withdrawn_at", {
      withTimezone: true,
    }),
    status: varchar("status", { length: 20 })
      .$type<TeamApplicationStatus>()
      .notNull()
      .default(teamApplicationStatuses.PENDING),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("team_applications_room_member_unique_idx").on(
      table.roomId,
      table.memberId,
    ),
    index("team_applications_room_status_idx").on(table.roomId, table.status),
    index("team_applications_member_idx").on(table.memberId),
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
