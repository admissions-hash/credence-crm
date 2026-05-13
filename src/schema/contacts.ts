import { pgTable, text, uuid, timestamp, varchar } from "drizzle-orm/pg-core";
import { accountsTable } from "./accounts";
import { usersTable } from "./auth";

export const contactsTable = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  title: text("title"),
  accountId: uuid("account_id").references(() => accountsTable.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  lifecycleStage: text("lifecycle_stage").notNull().default("lead"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const contactLifecycleHistoryTable = pgTable(
  "contact_lifecycle_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contactsTable.id, { onDelete: "cascade" }),
    fromStage: text("from_stage"),
    toStage: text("to_stage").notNull(),
    changedByUserId: varchar("changed_by_user_id").references(
      () => usersTable.id,
      { onDelete: "set null" },
    ),
    reason: text("reason"),
    changedAt: timestamp("changed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export type Contact = typeof contactsTable.$inferSelect;
export type InsertContact = typeof contactsTable.$inferInsert;
export type ContactLifecycleHistory =
  typeof contactLifecycleHistoryTable.$inferSelect;
