import {
  pgTable,
  text,
  uuid,
  timestamp,
  varchar,
  integer,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";
import { leadsTable } from "./leads";
import { activitiesTable } from "./activities";

export const availabilitySettingsTable = pgTable(
  "availability_settings",
  {
    userId: varchar("user_id")
      .primaryKey()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    slug: varchar("slug").notNull().unique(),
    weekdays: text("weekdays").notNull().default("1,2,3,4,5"),
    startMinute: integer("start_minute").notNull().default(540),
    endMinute: integer("end_minute").notNull().default(1020),
    durationMinutes: integer("duration_minutes").notNull().default(30),
    bufferMinutes: integer("buffer_minutes").notNull().default(0),
    timezone: text("timezone").notNull().default("Asia/Dubai"),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("availability_slug_idx").on(table.slug)],
);

export const bookingsTable = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    slotAt: timestamp("slot_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    parentName: text("parent_name").notNull(),
    parentEmail: text("parent_email").notNull(),
    parentPhone: text("parent_phone"),
    childName: text("child_name").notNull(),
    grade: text("grade"),
    notes: text("notes"),
    status: text("status").notNull().default("confirmed"),
    leadId: uuid("lead_id").references(() => leadsTable.id, {
      onDelete: "set null",
    }),
    activityId: uuid("activity_id").references(() => activitiesTable.id, {
      onDelete: "set null",
    }),
    calendarEventId: text("calendar_event_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Hard-stop double-bookings at the database level: even with
    // concurrent POSTs, only one row per (staff, slot) can land.
    uniqueIndex("bookings_user_slot_unique").on(table.userId, table.slotAt),
    index("bookings_slot_idx").on(table.slotAt),
  ],
);

export type AvailabilitySettings =
  typeof availabilitySettingsTable.$inferSelect;
export type InsertAvailabilitySettings =
  typeof availabilitySettingsTable.$inferInsert;
export type Booking = typeof bookingsTable.$inferSelect;
export type InsertBooking = typeof bookingsTable.$inferInsert;
