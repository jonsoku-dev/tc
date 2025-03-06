// subscriptions/schema.ts
import { pgTable, uuid, varchar, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { SUBSCRIPTION_STATUS } from "./constants";
import { users } from "../users/schema";

const subscriptionStatusEnum = pgEnum("status", SUBSCRIPTION_STATUS);

export const subscription_plans = pgTable("subscription_plans", {
  plan_id: uuid("plan_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  price: numeric("price").notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  subscription_id: uuid("subscription_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
  plan_id: uuid("plan_id")
    .notNull()
    .references(() => subscription_plans.plan_id, { onDelete: "cascade" }),
  status: subscriptionStatusEnum("status").notNull().default("active"),
});

export const subscription_invoices = pgTable("subscription_invoices", {
  invoice_id: uuid("invoice_id").primaryKey().defaultRandom(),
  subscription_id: uuid("subscription_id")
    .notNull()
    .references(() => subscriptions.subscription_id, { onDelete: "cascade" }),
  amount: numeric("amount").notNull(),
});

export const subscriptions_relations = relations(subscriptions, ({ one, many }) => ({
  plan: one(subscription_plans, {
    fields: [subscriptions.plan_id],
    references: [subscription_plans.plan_id],
  }),
  invoices: many(subscription_invoices),
}));