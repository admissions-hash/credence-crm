import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const csvImportsTable = pgTable("csv_imports", {
  id: uuid("id").primaryKey().defaultRandom(),
  entity: text("entity").notNull(),
  importedAt: timestamp("imported_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  importedBy: text("imported_by"),
  importedById: varchar("imported_by_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  totalRows: integer("total_rows").notNull(),
  validRows: integer("valid_rows").notNull(),
  insertedRows: integer("inserted_rows").notNull(),
  errorRows: integer("error_rows").notNull(),
  errorsJson: jsonb("errors_json").notNull().default([]),
});

export type CsvImport = typeof csvImportsTable.$inferSelect;
export type InsertCsvImport = typeof csvImportsTable.$inferInsert;
