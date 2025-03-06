// notifications/schema.ts
import { pgTable, uuid, varchar, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { NOTIFICATION_TYPES } from "./constants";
import { users } from "../users/schema";

const notificationTypeEnum = pgEnum("notification_type", NOTIFICATION_TYPES);

export const notifications = pgTable("notifications", {
  notification_id: uuid("notification_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  content: text("content").notNull(),
  is_read: boolean("is_read").default(false),
});

export const notifications_relations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.user_id], references: [users.user_id] }),
}));