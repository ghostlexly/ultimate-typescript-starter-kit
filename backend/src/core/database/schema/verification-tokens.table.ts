import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { accounts } from './accounts.table.js';
import { timestamps } from './timestamps.js';
import { verificationTypeEnum } from './verification-type.enum.js';

/** Short-lived token (login code, password reset, ...) tied to an account. */
export const verificationTokens = pgTable(
  'verification_tokens',
  {
    id: uuid().primaryKey().defaultRandom(),
    token: text().notNull().unique(),
    type: verificationTypeEnum().notNull(),
    value: text(), // Optional value being verified (new email, ...)
    attempts: integer().notNull().default(0), // Failed attempts, for brute-force protection
    accountId: uuid()
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [index('verification_tokens_expires_at_idx').on(table.expiresAt)],
);
