// interviews/schema.ts
import { pgTable, uuid, text, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { INTERVIEW_QUESTION_TYPES } from "./constants";
import { ebooks } from "../ebooks/schema";

export const questionTypeEnum = pgEnum("question_type", INTERVIEW_QUESTION_TYPES);

export const interview_questions = pgTable("interview_questions", {
  question_id: uuid("question_id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  is_required: boolean("is_required").default(false),
  question_type: questionTypeEnum("question_type").default("text"),
});

export const interview_answers = pgTable("interview_answers", {
  answer_id: uuid("answer_id").primaryKey().defaultRandom(),
  ebook_id: uuid("ebook_id")
    .notNull()
    .references(() => ebooks.ebook_id, { onDelete: "cascade" }),
  question_id: uuid("question_id")
    .notNull()
    .references(() => interview_questions.question_id, { onDelete: "cascade" }),
  answer_content: text("answer_content").notNull(),
});

export const interview_questions_relations = relations(interview_questions, ({ many }) => ({
  answers: many(interview_answers),
}));