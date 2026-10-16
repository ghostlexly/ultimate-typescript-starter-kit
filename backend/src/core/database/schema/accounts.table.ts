import {
  boolean,
  index,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { roleEnum } from './role.enum.js';
import { timestamps } from './timestamps.js';

/** Login identity: credentials, OAuth provider link and role. */
export const accounts = pgTable(
  'accounts',
  {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull().unique(),
    password: text(),
    role: roleEnum().notNull(),
    providerId: text(), // "google", "github", ...
    providerAccountId: text(), // Id of the account on the provider side
    isEmailVerified: boolean().notNull().default(false),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('accounts_provider_role_unique').on(
      table.providerId,
      table.providerAccountId,
      table.role,
    ),
    index('accounts_provider_idx').on(
      table.providerId,
      table.providerAccountId,
    ),
  ],
);
