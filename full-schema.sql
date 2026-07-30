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
CREATE INDEX "security_events_user_time_idx" ON "security_events" USING btree ("user_id","occurred_at");CREATE TABLE "local_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(80) NOT NULL,
	"nickname" varchar(30),
	"phone_number" varchar(30) NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"terms_version" varchar(30) NOT NULL,
	"privacy_version" varchar(30) NOT NULL,
	"required_terms_accepted_at" timestamp with time zone NOT NULL,
	"email_verified_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "local_users_email_unique" UNIQUE("email"),
	CONSTRAINT "local_users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE INDEX "local_users_email_idx" ON "local_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "local_users_phone_number_idx" ON "local_users" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "local_users_role_status_idx" ON "local_users" USING btree ("role","status");CREATE TABLE "offline_events" (
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
CREATE INDEX "application_logs_route_time_idx" ON "application_logs" USING btree ("route","occurred_at");CREATE TABLE "event_applications" (
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
CREATE INDEX "event_applications_event_member_idx" ON "event_applications" USING btree ("event_id","member_id");CREATE TABLE "community_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(20) NOT NULL,
	"title" varchar(140) NOT NULL,
	"description" text NOT NULL,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"author_user_id" text NOT NULL,
	"author_name" varchar(80) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "community_feedback_status_time_idx" ON "community_feedback" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "community_feedback_type_time_idx" ON "community_feedback" USING btree ("type","created_at");--> statement-breakpoint
CREATE INDEX "community_feedback_author_time_idx" ON "community_feedback" USING btree ("author_user_id","created_at");CREATE TABLE "community_feedback_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feedback_id" uuid NOT NULL,
	"author_user_id" text NOT NULL,
	"author_name" varchar(80) NOT NULL,
	"body" text NOT NULL,
	"previous_status" varchar(20),
	"next_status" varchar(20),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "community_feedback_comments_feedback_time_idx" ON "community_feedback_comments" USING btree ("feedback_id","created_at");--> statement-breakpoint
CREATE INDEX "community_feedback_comments_author_time_idx" ON "community_feedback_comments" USING btree ("author_user_id","created_at");