import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { accounts } from './accounts.table.js';
import { timestamps } from './timestamps.js';

/** Customer profile, one per account with the CUSTOMER role. */
export const customers = pgTable('customers', {
  id: uuid().primaryKey().defaultRandom(),
  accountId: uuid()
    .notNull()
    .unique()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  countryCode: text(),
  ...timestamps,
});
