CREATE TABLE "local_users" (
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
CREATE INDEX "local_users_role_status_idx" ON "local_users" USING btree ("role","status");