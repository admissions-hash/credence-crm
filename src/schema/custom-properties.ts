import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  integer,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/**
 * Admin-defined custom fields ("custom properties") that staff can attach
 * to leads, deals, accounts, and contacts without code changes.
 *
 * Soft-delete via `deletedAt` so that values are retained for 30 days
 * before being hard-purged by a future cleanup job — the spec calls for
 * the data to remain recoverable in that window.
 */
export const customPropertiesTable = pgTable(
  "custom_properties",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recordType: text("record_type").notNull(),
    // Stable machine identifier (slug). Used as the JSON object key on
    // record GETs and as the column header on CSV exports.
    key: text("key").notNull(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    required: boolean("required").notNull().default(false),
    // For single_select / multi_select properties: the picklist of allowed
    // values (string[]). Null otherwise.
    options: jsonb("options").$type<string[] | null>(),
    displayOrder: integer("display_order").notNull().default(0),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Each (recordType, key) must be unique among live properties. We can't
    // express "where deleted_at is null" in a Drizzle uniqueIndex declaration
    // here, so rely on the application layer to refuse re-using the key of a
    // soft-deleted property.
    uniqueIndex("custom_properties_record_type_key_idx").on(
      table.recordType,
      table.key,
    ),
    index("custom_properties_record_type_idx").on(table.recordType),
  ],
);

export type CustomProperty = typeof customPropertiesTable.$inferSelect;
export type InsertCustomProperty = typeof customPropertiesTable.$inferInsert;

/**
 * Per-record values for custom properties. `value` is always stored as
 * JSONB — primitive (text/number/boolean), ISO date string, or array of
 * strings (multi_select). Null means "no value".
 */
export const customPropertyValuesTable = pgTable(
  "custom_property_values",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => customPropertiesTable.id, { onDelete: "cascade" }),
    recordType: text("record_type").notNull(),
    recordId: uuid("record_id").notNull(),
    value: jsonb("value"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("custom_property_values_unique_idx").on(
      table.propertyId,
      table.recordId,
    ),
    index("custom_property_values_record_idx").on(
      table.recordType,
      table.recordId,
    ),
  ],
);

export type CustomPropertyValue =
  typeof customPropertyValuesTable.$inferSelect;
export type InsertCustomPropertyValue =
  typeof customPropertyValuesTable.$inferInsert;
