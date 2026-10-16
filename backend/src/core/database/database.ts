import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';
import type * as schema from './schema/index.js';

/**
 * Drizzle database instance, typed with the full schema so that
 * `db.query.accounts.findMany(...)` and friends are available.
 * `$client` exposes the underlying `pg` pool (used to close connections).
 *
 * The interface carries the Drizzle type, the (empty) class of the same name
 * exists only at runtime so NestJS can use it as an injection token.
 * Inject it by type, without any decorator:
 *   constructor(private readonly db: Database) {}
 */
// oxlint-disable-next-line typescript/no-unsafe-declaration-merging
export interface Database extends NodePgDatabase<typeof schema> {
  $client: Pool;
}

export class Database {}
