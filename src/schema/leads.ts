import {
  pgTable,
  text,
  uuid,
  timestamp,
  numeric,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const leadsTable = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  title: text("title"),
  status: text("status").notNull().default("new"),
  source: text("source").notNull().default("other"),
  owner: text("owner"),
  ownerId: varchar("owner_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  estimatedValue: numeric("estimated_value", { precision: 14, scale: 2 }),
  notes: text("notes"),
  // Engagement score 0–100 maintained by the lead-scoring engine. Updated
  // on activity create/update/delete and by the nightly decay job. Never
  // edited directly through the lead PATCH endpoint.
  score: integer("score").notNull().default(0),
  scoreUpdatedAt: timestamp("score_updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Lead = typeof leadsTable.$inferSelect;
export type InsertLead = typeof leadsTable.$inferInsert;
