import { createDatabase } from '../../../src/core/database/create-database.js';
import type { Database } from '../../../src/core/database/database.js';

let database: Database | undefined;

/**
 * Drizzle instance connected to the throwaway Postgres started by
 * `e2e-setup.ts`, shared by the e2e hooks and the `given*` fixtures.
 *
 * Opened lazily once per worker; `e2e-hooks.ts` closes it after the file.
 */
export function getTestDatabase(): Database {
  if (database) {
    return database;
  }

  const connectionString = process.env.APP_DATABASE_CONNECTION_URL;

  if (!connectionString) {
    throw new Error(
      'APP_DATABASE_CONNECTION_URL is not set: is the e2e globalSetup configured?',
    );
  }

  database = createDatabase(connectionString);

  return database;
}
