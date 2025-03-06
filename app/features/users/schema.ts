// users/schema.ts
import {
  boolean,
  integer,
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";
import { ROLES } from "~/features/users/constants";
import { relations } from "drizzle-orm";

// Supabase auth.users 테이블 (Drizzle ORM에서 코드 레벨로만 관리)
const original_users = pgSchema("auth").table("users", {
  id: uuid("id").primaryKey(),
});

// roles enum 정의
export const roles = pgEnum("role", ROLES.map((role) => role.value) as [string, ...string[]]);

// profiles 테이블 (users로 사용)
export const users = pgTable("profiles", {
  user_id: uuid("user_id")
    .primaryKey()
    .references(() => original_users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  username: text("username").notNull(),
  role: roles("role").default(ROLES[0].value),
  line_user_id: text("line_user_id"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// api_keys 테이블
export const api_keys = pgTable("api_keys", {
  api_key_id: uuid("api_key_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  key_hash: varchar("key_hash", { length: 255 }).notNull(),
  is_active: boolean("is_active").default(true),
});

// usage_limits 테이블
export const usage_limits = pgTable("usage_limits", {
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" })
    .primaryKey(),
  monthly_api_limit: integer("monthly_api_limit").default(1000),
  current_month_api_usage: integer("current_month_api_usage").default(0),
});

// 관계 정의
export const users_relations = relations(users, ({ many }) => ({
  api_keys: many(api_keys),
  usage_limits: many(usage_limits),
}));