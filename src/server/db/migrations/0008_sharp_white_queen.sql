ALTER TABLE "team_room_applications" ADD COLUMN "disclosure_consent_version" varchar(30);--> statement-breakpoint
ALTER TABLE "team_room_applications" ADD COLUMN "disclosure_consent_granted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "team_room_applications" ADD COLUMN "disclosure_consent_withdrawn_at" timestamp with time zone;