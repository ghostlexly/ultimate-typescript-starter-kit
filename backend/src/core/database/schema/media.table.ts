import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './timestamps.js';

/** File stored on S3. */
export const media = pgTable('media', {
  id: uuid().primaryKey().defaultRandom(),
  fileName: text().notNull(),
  key: text().notNull(), // Object key in the bucket
  mimeType: text().notNull(),
  size: integer().notNull(), // Bytes
  ...timestamps,
});
