import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './timestamps.js';

/** Key/value settings editable at runtime. */
export const appConfigs = pgTable('app_configs', {
  id: uuid().primaryKey().defaultRandom(),
  key: text().notNull().unique(),
  value: text().notNull(),
  ...timestamps,
});
