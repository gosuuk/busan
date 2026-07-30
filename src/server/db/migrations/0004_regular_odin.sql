CREATE TABLE "community_feedback" (
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
CREATE INDEX "community_feedback_author_time_idx" ON "community_feedback" USING btree ("author_user_id","created_at");