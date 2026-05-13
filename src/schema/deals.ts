import {
  pgTable,
  text,
  uuid,
  timestamp,
  numeric,
  integer,
  boolean,
  varchar,
} from "drizzle-orm/pg-core";
import { accountsTable } from "./accounts";
import { contactsTable } from "./contacts";
import { usersTable } from "./auth";

export const dealsTable = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  stage: text("stage").notNull().default("open_lead"),
  value: numeric("value", { precision: 14, scale: 2 }).notNull().default("0"),
  probability: integer("probability").notNull().default(0),
  expectedCloseDate: timestamp("expected_close_date", { withTimezone: true }),
  accountId: uuid("account_id").references(() => accountsTable.id, {
    onDelete: "set null",
  }),
  primaryContactId: uuid("primary_contact_id").references(
    () => contactsTable.id,
    { onDelete: "set null" },
  ),
  owner: text("owner"),
  ownerId: varchar("owner_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  gradeApplying: text("grade_applying"),
  studentLocation: text("student_location").notNull().default("in_dubai"),
  isSibling: boolean("is_sibling").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const dealStageHistoryTable = pgTable("deal_stage_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id")
    .notNull()
    .references(() => dealsTable.id, { onDelete: "cascade" }),
  fromStage: text("from_stage"),
  toStage: text("to_stage").notNull(),
  note: text("note"),
  changedAt: timestamp("changed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Deal = typeof dealsTable.$inferSelect;
export type InsertDeal = typeof dealsTable.$inferInsert;
export type DealStageHistory = typeof dealStageHistoryTable.$inferSelect;
export type InsertDealStageHistory =
  typeof dealStageHistoryTable.$inferInsert;
