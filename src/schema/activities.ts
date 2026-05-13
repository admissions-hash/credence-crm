import { pgTable, text, uuid, timestamp, varchar } from "drizzle-orm/pg-core";
import { accountsTable } from "./accounts";
import { contactsTable } from "./contacts";
import { leadsTable } from "./leads";
import { dealsTable } from "./deals";
import { usersTable } from "./auth";

export const activitiesTable = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(),
  subject: text("subject").notNull(),
  body: text("body"),
  occurredAt: timestamp("occurred_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  owner: text("owner"),
  ownerId: varchar("owner_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  dealId: uuid("deal_id").references(() => dealsTable.id, {
    onDelete: "cascade",
  }),
  leadId: uuid("lead_id").references(() => leadsTable.id, {
    onDelete: "cascade",
  }),
  contactId: uuid("contact_id").references(() => contactsTable.id, {
    onDelete: "set null",
  }),
  accountId: uuid("account_id").references(() => accountsTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Activity = typeof activitiesTable.$inferSelect;
export type InsertActivity = typeof activitiesTable.$inferInsert;
