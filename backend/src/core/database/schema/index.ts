/**
 * Single entry point for the Drizzle schema.
 *
 * Both `drizzle.config.ts` (migrations) and the `DatabaseModule` (typed
 * `db.query.*` API) import everything from here, so every new table or enum
 * must be re-exported below.
 */
export * from './role.enum.js';
export * from './verification-type.enum.js';
export * from './accounts.table.js';
export * from './sessions.table.js';
export * from './customers.table.js';
export * from './admins.table.js';
export * from './verification-tokens.table.js';
export * from './media.table.js';
export * from './app-configs.table.js';
