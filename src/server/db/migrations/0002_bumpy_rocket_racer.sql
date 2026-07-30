CREATE TABLE "offline_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"description" text NOT NULL,
	"location_name" varchar(120) NOT NULL,
	"address" varchar(300),
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"capacity" integer NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"created_by_user_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "offline_events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "application_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" varchar(20) NOT NULL,
	"message" varchar(300) NOT NULL,
	"route" varchar(300),
	"method" varchar(10),
	"status" varchar(20),
	"user_id" text,
	"request_id" varchar(120),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "offline_events_status_start_idx" ON "offline_events" USING btree ("status","starts_at");--> statement-breakpoint
CREATE INDEX "offline_events_created_by_idx" ON "offline_events" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "application_logs_level_time_idx" ON "application_logs" USING btree ("level","occurred_at");--> statement-breakpoint
CREATE INDEX "application_logs_route_time_idx" ON "application_logs" USING btree ("route","occurred_at");