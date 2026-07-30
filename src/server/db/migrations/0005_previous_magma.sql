CREATE TABLE "community_feedback_comments" (
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