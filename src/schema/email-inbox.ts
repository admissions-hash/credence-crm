import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  bigint,
  index,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { contactsTable } from "./contacts";
import { usersTable } from "./auth";

/**
 * Conversation thread (one row per Gmail threadId we've ingested).
 * `contactId` is nullable: messages we cannot match to a known contact land
 * in the "Unmatched" bucket and stay there until a contact with the matching
 * email exists, at which point a future sync run can link them.
 */
export const emailThreadsTable = pgTable(
  "email_threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gmailThreadId: text("gmail_thread_id").notNull(),
    contactId: uuid("contact_id").references(() => contactsTable.id, {
      onDelete: "set null",
    }),
    // Staff member who "owns" this conversation. Used by the inbox Owner
    // filter (My / Unassigned / Anyone). Auto-assigned to the first staff
    // user who replies if currently unassigned.
    assigneeId: varchar("assignee_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    subject: text("subject"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    lastSnippet: text("last_snippet"),
    lastFromEmail: text("last_from_email"),
    lastFromName: text("last_from_name"),
    // Total inbound messages on this thread that haven't been viewed in the
    // CRM yet. Outbound messages don't add to the count.
    unreadCount: integer("unread_count").notNull().default(0),
    // open | closed — staff can mark a thread closed once handled.
    status: text("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("email_threads_gmail_thread_unique").on(table.gmailThreadId),
    index("email_threads_contact_idx").on(table.contactId),
    index("email_threads_assignee_idx").on(table.assigneeId),
    index("email_threads_status_last_idx").on(table.status, table.lastMessageAt),
  ],
);

export const emailMessagesTable = pgTable(
  "email_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => emailThreadsTable.id, { onDelete: "cascade" }),
    gmailMessageId: text("gmail_message_id").notNull(),
    // inbound (from family) | outbound (sent by school)
    direction: text("direction").notNull(),
    fromEmail: text("from_email"),
    fromName: text("from_name"),
    // Comma-separated list of "to" recipients — kept simple for v1.
    toEmails: text("to_emails"),
    subject: text("subject"),
    snippet: text("snippet"),
    bodyHtml: text("body_html"),
    bodyText: text("body_text"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("email_messages_gmail_msg_unique").on(table.gmailMessageId),
    index("email_messages_thread_sent_idx").on(table.threadId, table.sentAt),
  ],
);

/**
 * Singleton row that tracks where the Gmail poller is in time. We keep it as
 * a bigint of Gmail's `internalDate` (ms since epoch) so the sync can ask for
 * messages after the last one we ingested, regardless of sender.
 */
export const emailInboxStateTable = pgTable("email_inbox_state", {
  id: varchar("id").primaryKey(), // always "singleton"
  lastInternalDateMs: bigint("last_internal_date_ms", { mode: "number" }),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
});

export type EmailThread = typeof emailThreadsTable.$inferSelect;
export type InsertEmailThread = typeof emailThreadsTable.$inferInsert;
export type EmailMessage = typeof emailMessagesTable.$inferSelect;
export type InsertEmailMessage = typeof emailMessagesTable.$inferInsert;
