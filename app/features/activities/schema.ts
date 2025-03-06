// activities/schema.ts
import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { USER_ACTION_TYPES } from "./constants";
import { users } from "../users/schema";
import { ebooks } from "../ebooks/schema";

const actionTypeEnum = pgEnum("action_type", USER_ACTION_TYPES);

export const user_actions = pgTable("user_actions", {
  action_id: uuid("action_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
  action_type: actionTypeEnum("action_type").notNull(),
});

export const reviews = pgTable("reviews", {
  review_id: uuid("review_id").primaryKey().defaultRandom(),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
});

export const bookmarks = pgTable("bookmarks", {
  bookmark_id: uuid("bookmark_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
});

export const shares = pgTable("shares", {
  share_id: uuid("share_id").primaryKey().defaultRandom(),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
  share_type: varchar("share_type", { length: 50 }).notNull(),
});

export const reviews_relations = relations(reviews, ({ one }) => ({
  ebook: one(ebooks, { fields: [reviews.ebook_id], references: [ebooks.ebook_id] }),
}));