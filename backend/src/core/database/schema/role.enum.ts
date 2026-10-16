import { pgEnum } from 'drizzle-orm/pg-core';

/** Role attached to an account, used for authorization. */
export const roleEnum = pgEnum('role', ['ADMIN', 'CUSTOMER']);
