import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { accounts } from './accounts.table.js';
import { timestamps } from './timestamps.js';

/** Admin profile, one per account with the ADMIN role. */
export const admins = pgTable('admins', {
  id: uuid().primaryKey().defaultRandom(),
  accountId: uuid()
    .notNull()
    .unique()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  ...timestamps,
});
