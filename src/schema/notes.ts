import {
  pgTable,
  text,
  uuid,
  timestamp,
  varchar,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const notesTable = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recordType: text("record_type").notNull(),
    recordId: uuid("record_id").notNull(),
    body: text("body").notNull(),
    authorId: varchar("author_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    isPinned: boolean("is_pinned").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("notes_record_idx").on(table.recordType, table.recordId),
  ],
);

export type Note = typeof notesTable.$inferSelect;
export type InsertNote = typeof notesTable.$inferInsert;
