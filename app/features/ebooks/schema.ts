// ebooks/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  numeric,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { EBOOK_STATUS } from "./constants";
import { users } from "../users/schema";

const statusEnum = pgEnum("status", EBOOK_STATUS);

export const ebooks = pgTable("ebooks", {
  ebook_id: uuid("ebook_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: statusEnum("status").notNull().default("draft"),
  price: numeric("price"),
});

export const categories = pgTable("categories", {
  category_id: uuid("category_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const collaborators = pgTable("collaborators", {
  collaborator_id: uuid("collaborator_id").primaryKey().defaultRandom(),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
  permission: varchar("permission", { length: 50 }).notNull().default("edit"),
});

export const ebook_versions = pgTable("ebook_versions", {
  version_id: uuid("version_id").primaryKey().defaultRandom(),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
  version_number: integer("version_number").notNull(),
  content_markdown: text("content_markdown"),
});

export const ebooks_relations = relations(ebooks, ({ one, many }) => ({
  author: one(users, { fields: [ebooks.user_id], references: [users.user_id] }),
  collaborators: many(collaborators),
  versions: many(ebook_versions),
}));