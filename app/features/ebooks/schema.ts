import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  numeric,
  pgEnum,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { EBOOK_STATUS, PAGE_CONTENT_TYPE } from "./constants";
import { users } from "../users/schema";

// Enum 정의
export const ebookStatusEnum = pgEnum("ebook_status", EBOOK_STATUS);
export const pageContentTypeEnum = pgEnum("page_content_type", PAGE_CONTENT_TYPE);

// ebooks 테이블 (확장된 필드 포함)
export const ebooks = pgTable("ebooks", {
  ebook_id: uuid("ebook_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  ebook_status: ebookStatusEnum("status").notNull().default("draft"),
  price: numeric("price"),
  // 새로운 필드 추가
  cover_image_url: text("cover_image_url"),
  sample_content: text("sample_content"),
  table_of_contents: jsonb("table_of_contents").$type<string[]>().default([]),
  page_count: integer("page_count").default(0),
  language: varchar("language", { length: 50 }).default("ko"),
  publication_date: timestamp("publication_date"),
  isbn: varchar("isbn", { length: 20 }),
  is_featured: boolean("is_featured").default(false),
  reading_time: integer("reading_time"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// 페이지 테이블 (새로 추가)
export const ebook_pages = pgTable("ebook_pages", {
  page_id: uuid("page_id").primaryKey().defaultRandom(),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
  page_number: integer("page_number").notNull(),
  title: varchar("title", { length: 255 }),
  content_type: pageContentTypeEnum("content_type").notNull().default("text"),
  content: jsonb("content").notNull(), // 다양한 콘텐츠 타입을 지원하기 위한 JSON 필드
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// categories 테이블 (기존 유지)
export const categories = pgTable("categories", {
  category_id: uuid("category_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
});

// collaborators 테이블 (기존 유지)
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

// ebook_versions 테이블 (기존 유지)
export const ebook_versions = pgTable("ebook_versions", {
  version_id: uuid("version_id").primaryKey().defaultRandom(),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
  version_number: integer("version_number").notNull(),
  content_markdown: text("content_markdown"),
});

// reading_progress 테이블 (페이지 기반으로 수정)
export const reading_progress = pgTable("reading_progress", {
  progress_id: uuid("progress_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
  current_page: integer("current_page").default(1),
  progress_percentage: numeric("progress_percentage").default("0"),
  last_read_at: timestamp("last_read_at").defaultNow(),
  is_completed: boolean("is_completed").default(false),
});

// reviews 테이블 (기존 유지)
export const reviews = pgTable("reviews", {
  review_id: uuid("review_id").primaryKey().defaultRandom(),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// bookmarks 테이블 (페이지 기반으로 수정)
export const bookmarks = pgTable("bookmarks", {
  bookmark_id: uuid("bookmark_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
  page_number: integer("page_number").notNull(),
  title: varchar("title", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
});

// highlights 테이블 (페이지 기반으로 수정)
export const highlights = pgTable("highlights", {
  highlight_id: uuid("highlight_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
  page_number: integer("page_number").notNull(),
  start_position: integer("start_position").notNull(),
  end_position: integer("end_position").notNull(),
  text: text("text"),
  color: varchar("color", { length: 50 }),
  note: text("note"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// 관계 설정
export const ebooks_relations = relations(ebooks, ({ one, many }) => ({
  author: one(users, { fields: [ebooks.user_id], references: [users.user_id] }),
  collaborators: many(collaborators),
  versions: many(ebook_versions),
  pages: many(ebook_pages),
  reading_progress: many(reading_progress),
  reviews: many(reviews),
  bookmarks: many(bookmarks),
  highlights: many(highlights),
}));

export const ebook_pages_relations = relations(ebook_pages, ({ one }) => ({
  ebook: one(ebooks, {
    fields: [ebook_pages.ebook_id],
    references: [ebooks.ebook_id],
  }),
}));

export const reading_progress_relations = relations(reading_progress, ({ one }) => ({
  ebook: one(ebooks, {
    fields: [reading_progress.ebook_id],
    references: [ebooks.ebook_id],
  }),
  user: one(users, {
    fields: [reading_progress.user_id],
    references: [users.user_id],
  }),
}));

export const reviews_relations = relations(reviews, ({ one }) => ({
  ebook: one(ebooks, {
    fields: [reviews.ebook_id],
    references: [ebooks.ebook_id],
  }),
  user: one(users, {
    fields: [reviews.user_id],
    references: [users.user_id],
  }),
}));

export const bookmarks_relations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.user_id],
    references: [users.user_id],
  }),
  ebook: one(ebooks, {
    fields: [bookmarks.ebook_id],
    references: [ebooks.ebook_id],
  }),
}));

export const highlights_relations = relations(highlights, ({ one }) => ({
  user: one(users, {
    fields: [highlights.user_id],
    references: [users.user_id],
  }),
  ebook: one(ebooks, {
    fields: [highlights.ebook_id],
    references: [ebooks.ebook_id],
  }),
}));