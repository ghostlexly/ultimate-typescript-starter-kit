import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { Database } from './database.js';
import * as schema from './schema/index.js';

/**
 * Builds a Drizzle instance backed by a `pg` connection pool.
 *
 * Shared by the `DatabaseModule` and by scripts/tests that need a database
 * outside of the NestJS container (e2e setup, migrations, ...).
 * Call `database.$client.end()` to release the pool.
 */
export function createDatabase(connectionString: string): Database {
  const pool = new Pool({ connectionString });

  return drizzle({
    client: pool,
    schema,
    // Must match `casing` in drizzle.config.ts
    casing: 'snake_case',
  });
}
