CREATE TYPE "public"."page_content_type" AS ENUM('text', 'image', 'table', 'code', 'video', 'audio', 'mixed');--> statement-breakpoint
CREATE TABLE "ebook_pages" (
	"page_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ebook_id" uuid NOT NULL,
	"page_number" integer NOT NULL,
	"title" varchar(255),
	"content_type" "page_content_type" DEFAULT 'text' NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ebooks" ALTER COLUMN "page_count" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "reading_progress" ALTER COLUMN "current_page" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD COLUMN "title" varchar(255);--> statement-breakpoint
ALTER TABLE "highlights" ADD COLUMN "page_number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "highlights" ADD COLUMN "text" text;--> statement-breakpoint
ALTER TABLE "ebook_pages" ADD CONSTRAINT "ebook_pages_ebook_id_ebooks_ebook_id_fk" FOREIGN KEY ("ebook_id") REFERENCES "public"."ebooks"("ebook_id") ON DELETE cascade ON UPDATE no action;