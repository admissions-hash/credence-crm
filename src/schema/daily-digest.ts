import { pgTable, varchar, date, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const dailyDigestSendsTable = pgTable(
  "daily_digest_sends",
  {
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    sentForDate: date("sent_for_date").notNull(),
    overdueCount: integer("overdue_count").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.sentForDate] })],
);

export type DailyDigestSend = typeof dailyDigestSendsTable.$inferSelect;
export type InsertDailyDigestSend = typeof dailyDigestSendsTable.$inferInsert;
