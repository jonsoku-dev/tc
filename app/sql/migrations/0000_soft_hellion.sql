CREATE TYPE "public"."alert_status" AS ENUM('UNREAD', 'READ', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."alert_type" AS ENUM('SYSTEM_NOTIFICATION');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADVERTISER', 'INFLUENCER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "alert_settings" (
	"setting_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"email_notifications" boolean DEFAULT true,
	"push_notifications" boolean DEFAULT true,
	"line_notifications" boolean DEFAULT true,
	"campaign_alerts" boolean DEFAULT true,
	"application_alerts" boolean DEFAULT true,
	"proposal_alerts" boolean DEFAULT true,
	"system_alerts" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"alert_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_id" uuid NOT NULL,
	"sender_id" uuid,
	"alert_type" "alert_type" NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"link" text,
	"metadata" text,
	"alert_status" "alert_status" DEFAULT 'UNREAD' NOT NULL,
	"is_important" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "auth.users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"profile_id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"username" text NOT NULL,
	"role" "role" DEFAULT 'ADVERTISER',
	"line_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alert_settings" ADD CONSTRAINT "alert_settings_profile_id_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_recipient_id_profiles_profile_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_sender_id_profiles_profile_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_profile_id_users_id_fk" FOREIGN KEY ("profile_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;