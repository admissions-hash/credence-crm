import {
  pgTable,
  text,
  uuid,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const emailTemplatesTable = pgTable(
  "email_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    subject: text("subject").notNull(),
    bodyHtml: text("body_html").notNull(),
    createdBy: varchar("created_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("email_templates_name_idx").on(table.name)],
);

export type EmailTemplate = typeof emailTemplatesTable.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplatesTable.$inferInsert;
