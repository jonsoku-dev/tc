ALTER TABLE "ebook_pages" ADD COLUMN "position" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "ebooks" DROP COLUMN "table_of_contents";