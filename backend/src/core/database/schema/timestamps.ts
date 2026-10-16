import { timestamp } from 'drizzle-orm/pg-core';

/**
 * Audit columns shared by every table.
 *
 * `updatedAt` is refreshed by Drizzle on every `db.update()` call; raw SQL
 * updates must set it explicitly.
 */
export const timestamps = {
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};
