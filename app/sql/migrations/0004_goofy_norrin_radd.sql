CREATE TABLE "ebook_categories" (
	"ebook_category_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ebook_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "collaborators" ALTER COLUMN "permission" SET DEFAULT 'view';--> statement-breakpoint
ALTER TABLE "highlights" ALTER COLUMN "text" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "highlights" ALTER COLUMN "color" SET DEFAULT 'yellow';--> statement-breakpoint
ALTER TABLE "bookmarks" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "collaborators" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "collaborators" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "ebook_pages" ADD COLUMN "blocks" jsonb;--> statement-breakpoint
ALTER TABLE "ebook_versions" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "reading_progress" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "reading_progress" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "ebook_categories" ADD CONSTRAINT "ebook_categories_ebook_id_ebooks_ebook_id_fk" FOREIGN KEY ("ebook_id") REFERENCES "public"."ebooks"("ebook_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebook_categories" ADD CONSTRAINT "ebook_categories_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebook_pages" DROP COLUMN "content_type";--> statement-breakpoint
ALTER TABLE "ebook_pages" DROP COLUMN "content";--> statement-breakpoint
DROP TYPE "public"."page_content_type";