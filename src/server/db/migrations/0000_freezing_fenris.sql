CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"session_id" uuid,
	"event_name" varchar(100) NOT NULL,
	"event_version" varchar(10) NOT NULL,
	"page_path" varchar(300),
	"referrer_domain" varchar(200),
	"entity_type" varchar(30),
	"entity_id" uuid,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source" varchar(20) NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"consent_type" varchar(50) NOT NULL,
	"policy_version" varchar(30) NOT NULL,
	"is_granted" boolean NOT NULL,
	"source" varchar(30) NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"nickname" varchar(30) NOT NULL,
	"introduction" varchar(500),
	"job_category" varchar(50),
	"experience_range" varchar(20),
	"github_url" varchar(300),
	"portfolio_url" varchar(300),
	"profile_image_url" varchar(500),
	"metadata" jsonb DEFAULT '{"interestedTopics":[],"activityAreas":[],"networkingGoals":[]}'::jsonb NOT NULL,
	"is_profile_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "member_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" text,
	"actor_role" varchar(30),
	"action" varchar(100) NOT NULL,
	"target_type" varchar(50),
	"target_id" text,
	"reason" varchar(500),
	"request_id" varchar(120),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deletion_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"status" varchar(20) NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"failure_code" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "security_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"event_type" varchar(100) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"route" varchar(300),
	"request_id" varchar(120),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "analytics_events_name_time_idx" ON "analytics_events" USING btree ("event_name","occurred_at");--> statement-breakpoint
CREATE INDEX "analytics_events_user_time_idx" ON "analytics_events" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "member_consents_user_type_idx" ON "member_consents" USING btree ("user_id","consent_type");--> statement-breakpoint
CREATE INDEX "member_profiles_nickname_idx" ON "member_profiles" USING btree ("nickname");--> statement-breakpoint
CREATE INDEX "member_profiles_job_category_idx" ON "member_profiles" USING btree ("job_category");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_time_idx" ON "audit_logs" USING btree ("actor_user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_logs_action_time_idx" ON "audit_logs" USING btree ("action","occurred_at");--> statement-breakpoint
CREATE INDEX "deletion_jobs_status_requested_idx" ON "deletion_jobs" USING btree ("status","requested_at");--> statement-breakpoint
CREATE INDEX "security_events_type_time_idx" ON "security_events" USING btree ("event_type","occurred_at");--> statement-breakpoint
CREATE INDEX "security_events_user_time_idx" ON "security_events" USING btree ("user_id","occurred_at");