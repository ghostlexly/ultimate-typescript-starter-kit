import { getTableName, is, sql } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import * as schema from '../../../src/core/database/schema/index.js';
import { getTestDatabase } from './test-database.js';

/**
 * Hooks registered for every e2e file (see `setupFiles` in
 * vitest.config.e2e.ts).
 *
 * The e2e files share the single Postgres started by `e2e-setup.ts`, so each
 * test gets an empty database: every table declared in the Drizzle schema is
 * truncated after each test. Tests never need to clean up after themselves.
 */

/** Every table exported by the schema, resolved once per worker. */
const SCHEMA_EXPORTS: unknown[] = Object.values(schema);
const TABLE_NAMES = SCHEMA_EXPORTS.filter((value): value is PgTable =>
  is(value, PgTable),
).map((table) => `"${getTableName(table)}"`);

afterEach(async () => {
  // CASCADE follows foreign keys, RESTART IDENTITY resets sequences
  await getTestDatabase().execute(
    sql.raw(
      `TRUNCATE TABLE ${TABLE_NAMES.join(', ')} RESTART IDENTITY CASCADE`,
    ),
  );
});

afterAll(async () => {
  await getTestDatabase().$client.end();
});
