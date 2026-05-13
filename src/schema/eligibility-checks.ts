import {
  pgTable,
  text,
  uuid,
  timestamp,
  varchar,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";
import { dealsTable } from "./deals";

/**
 * eligibility_checks — uploaded student report cards evaluated against
 * the Credence High School admission policy (Grades 2–12).
 *
 * The file itself lives in object storage; this row stores the verdict,
 * the marks the AI extracted, and the inputs the rules engine used so
 * staff can audit the decision later.
 */
export const eligibilityChecksTable = pgTable(
  "eligibility_checks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dealId: uuid("deal_id").references(() => dealsTable.id, {
      onDelete: "set null",
    }),
    studentName: text("student_name").notNull(),
    targetGrade: text("target_grade").notNull(),
    location: text("location").notNull(),
    fileObjectPath: text("file_object_path").notNull(),
    fileMimeType: text("file_mime_type").notNull(),
    fileName: text("file_name"),
    extractedMarks: jsonb("extracted_marks"),
    verdict: text("verdict").notNull(),
    reasoning: text("reasoning").notNull(),
    createdBy: varchar("created_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("eligibility_checks_deal_idx").on(table.dealId),
    index("eligibility_checks_created_idx").on(table.createdAt),
  ],
);

export type EligibilityCheck = typeof eligibilityChecksTable.$inferSelect;
export type InsertEligibilityCheck =
  typeof eligibilityChecksTable.$inferInsert;
