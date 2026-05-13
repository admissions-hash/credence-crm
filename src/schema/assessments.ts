import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { dealsTable } from "./deals";

export const assessmentsTable = pgTable("assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id")
    .notNull()
    .references(() => dealsTable.id, { onDelete: "cascade" }),
  englishScore: integer("english_score"),
  mathScore: integer("math_score"),
  scienceScore: integer("science_score"),
  interviewScore: integer("interview_score"),
  testEnglishScore: integer("test_english_score"),
  testMathScore: integer("test_math_score"),
  result: text("result").notNull().default("pending"),
  notes: text("notes"),
  assessedAt: timestamp("assessed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Assessment = typeof assessmentsTable.$inferSelect;
export type InsertAssessment = typeof assessmentsTable.$inferInsert;
