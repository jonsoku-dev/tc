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
  ebook_status: ebookStatusEnum("ebook_status").notNull().default("draft"),
  price: numeric("price"),
  // 새로운 필드 추가
  cover_image_url: text("cover_image_url"),
  sample_content: text("sample_content"),
  page_count: integer("page_count").default(0),
  language: varchar("language", { length: 50 }).default("ko"),
  publication_date: timestamp("publication_date"),
  isbn: varchar("isbn", { length: 20 }),
  is_featured: boolean("is_featured").default(false),
  reading_time: integer("reading_time"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// ebook_pages 테이블 (블록 기반 아키텍처로 수정)
export const ebook_pages = pgTable("ebook_pages", {
  page_id: uuid("page_id").primaryKey().defaultRandom(),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
  page_number: integer("page_number").notNull(),
  position: integer("position").notNull(),
  title: varchar("title", { length: 255 }),
  // 레거시 필드 (이전 버전과의 호환성 유지)
  content_type: pageContentTypeEnum("content_type"),
  content: jsonb("content"),
  // 새로운 블록 기반 필드
  blocks: jsonb("blocks"), // 블록 배열을 JSON으로 저장
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// categories 테이블
export const categories = pgTable("categories", {
  category_id: uuid("category_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// ebook_categories 테이블 (다대다 관계)
export const ebook_categories = pgTable("ebook_categories", {
  ebook_category_id: uuid("ebook_category_id").primaryKey().defaultRandom(),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
  category_id: uuid("category_id")
    .notNull()
    .references(() => categories.category_id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow(),
});

// collaborators 테이블
export const collaborators = pgTable("collaborators", {
  collaborator_id: uuid("collaborator_id").primaryKey().defaultRandom(),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
  permission: varchar("permission", { length: 50 }).notNull().default("view"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// ebook_versions 테이블
export const ebook_versions = pgTable("ebook_versions", {
  version_id: uuid("version_id").primaryKey().defaultRandom(),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
  version_number: integer("version_number").notNull(),
  content_markdown: text("content_markdown"),
  created_at: timestamp("created_at").defaultNow(),
});

// reading_progress 테이블
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
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// reviews 테이블
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

// bookmarks 테이블
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
  updated_at: timestamp("updated_at").defaultNow(),
});

// highlights 테이블
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
  text: text("text").notNull(),
  color: varchar("color", { length: 50 }).default("yellow"),
  note: text("note"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// 관계 정의
export const ebooksRelations = relations(ebooks, ({ many }) => ({
  pages: many(ebook_pages),
  categories: many(ebook_categories),
  collaborators: many(collaborators),
  versions: many(ebook_versions),
  readingProgress: many(reading_progress),
  reviews: many(reviews),
  bookmarks: many(bookmarks),
  highlights: many(highlights),
}));

export const ebookPagesRelations = relations(ebook_pages, ({ one }) => ({
  ebook: one(ebooks, {
    fields: [ebook_pages.ebook_id],
    references: [ebooks.ebook_id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  ebooks: many(ebook_categories),
}));

export const ebookCategoriesRelations = relations(ebook_categories, ({ one }) => ({
  ebook: one(ebooks, {
    fields: [ebook_categories.ebook_id],
    references: [ebooks.ebook_id],
  }),
  category: one(categories, {
    fields: [ebook_categories.category_id],
    references: [categories.category_id],
  }),
}));

export const collaboratorsRelations = relations(collaborators, ({ one }) => ({
  ebook: one(ebooks, {
    fields: [collaborators.ebook_id],
    references: [ebooks.ebook_id],
  }),
  user: one(users, {
    fields: [collaborators.user_id],
    references: [users.user_id],
  }),
}));

export const ebookVersionsRelations = relations(ebook_versions, ({ one }) => ({
  ebook: one(ebooks, {
    fields: [ebook_versions.ebook_id],
    references: [ebooks.ebook_id],
  }),
}));

export const readingProgressRelations = relations(reading_progress, ({ one }) => ({
  ebook: one(ebooks, {
    fields: [reading_progress.ebook_id],
    references: [ebooks.ebook_id],
  }),
  user: one(users, {
    fields: [reading_progress.user_id],
    references: [users.user_id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  ebook: one(ebooks, {
    fields: [reviews.ebook_id],
    references: [ebooks.ebook_id],
  }),
  user: one(users, {
    fields: [reviews.user_id],
    references: [users.user_id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  ebook: one(ebooks, {
    fields: [bookmarks.ebook_id],
    references: [ebooks.ebook_id],
  }),
  user: one(users, {
    fields: [bookmarks.user_id],
    references: [users.user_id],
  }),
}));

export const highlightsRelations = relations(highlights, ({ one }) => ({
  ebook: one(ebooks, {
    fields: [highlights.ebook_id],
    references: [ebooks.ebook_id],
  }),
  user: one(users, {
    fields: [highlights.user_id],
    references: [users.user_id],
  }),
}));