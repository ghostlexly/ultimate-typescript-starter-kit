import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { accounts } from './accounts.table.js';
import { timestamps } from './timestamps.js';

/** Refresh-token session opened by an account. */
export const sessions = pgTable(
  'sessions',
  {
    id: uuid().primaryKey().defaultRandom(),
    accountId: uuid()
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    ipAddress: text(), // Optional: tracking for security
    userAgent: text(), // Optional: tracking for security
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [
    index('sessions_expires_at_idx').on(table.expiresAt),
    index('sessions_account_id_idx').on(table.accountId),
  ],
);
