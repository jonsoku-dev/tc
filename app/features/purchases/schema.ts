// purchases/schema.ts
import { pgTable, uuid, varchar, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { PAYMENT_TYPES } from "./constants";
import { users } from "../users/schema";
import { ebooks } from "../ebooks/schema";

const paymentTypeEnum = pgEnum("payment_type", PAYMENT_TYPES);

export const sales = pgTable("sales", {
  sale_id: uuid("sale_id").primaryKey().defaultRandom(),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
  payment_type: paymentTypeEnum("payment_type").notNull(),
  price: numeric("price").notNull(),
  purchased_at: timestamp("purchased_at").notNull().defaultNow(),
});

export const carts = pgTable("carts", {
  cart_id: uuid("cart_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.user_id, { onDelete: "cascade" }),
});

export const cart_items = pgTable("cart_items", {
  cart_item_id: uuid("cart_item_id").primaryKey().defaultRandom(),
  cart_id: uuid("cart_id")
    .notNull()
    .references(() => carts.cart_id, { onDelete: "cascade" }),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
});

export const discount_codes = pgTable("discount_codes", {
  discount_code_id: uuid("discount_code_id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discount_value: numeric("discount_value").notNull(),
});

export const carts_relations = relations(carts, ({ many }) => ({
  items: many(cart_items),
}));