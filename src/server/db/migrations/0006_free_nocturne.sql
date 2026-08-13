CREATE TABLE "team_recruitment_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"leader_id" text NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"needed_roles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"capacity" integer NOT NULL,
	"contact" varchar(300),
	"status" varchar(20) DEFAULT 'recruiting' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_room_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"member_id" text NOT NULL,
	"message" varchar(500),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "offline_events" ADD COLUMN "category" varchar(30) DEFAULT 'meetup' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "team_rooms_event_leader_unique_idx" ON "team_recruitment_rooms" USING btree ("event_id","leader_id");--> statement-breakpoint
CREATE INDEX "team_rooms_event_status_idx" ON "team_recruitment_rooms" USING btree ("event_id","status");--> statement-breakpoint
CREATE INDEX "team_rooms_leader_idx" ON "team_recruitment_rooms" USING btree ("leader_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_applications_room_member_unique_idx" ON "team_room_applications" USING btree ("room_id","member_id");--> statement-breakpoint
CREATE INDEX "team_applications_room_status_idx" ON "team_room_applications" USING btree ("room_id","status");--> statement-breakpoint
CREATE INDEX "team_applications_member_idx" ON "team_room_applications" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "offline_events_category_status_idx" ON "offline_events" USING btree ("category","status");