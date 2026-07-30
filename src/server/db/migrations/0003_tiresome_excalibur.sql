CREATE TABLE "event_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"member_id" text NOT NULL,
	"participation_reason" varchar(500),
	"attendance_status" varchar(30) DEFAULT 'registered' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member_profiles" ALTER COLUMN "metadata" SET DEFAULT '{"interestedTopics":[],"activityAreas":[],"networkingGoals":[],"isOpenToNetworking":false}'::jsonb;--> statement-breakpoint
ALTER TABLE "offline_events" ADD COLUMN "region" varchar(80) DEFAULT '부산' NOT NULL;--> statement-breakpoint
ALTER TABLE "offline_events" ADD COLUMN "target_roles" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "offline_events" ADD COLUMN "tech_topics" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "offline_events" ADD COLUMN "participation_fee" varchar(80) DEFAULT '무료' NOT NULL;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "public_email" varchar(255);--> statement-breakpoint
CREATE INDEX "event_applications_event_status_idx" ON "event_applications" USING btree ("event_id","attendance_status");--> statement-breakpoint
CREATE INDEX "event_applications_member_idx" ON "event_applications" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "event_applications_event_member_idx" ON "event_applications" USING btree ("event_id","member_id");