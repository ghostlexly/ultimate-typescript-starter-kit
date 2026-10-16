import { Global, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.types.js';
import { createDatabase } from './create-database.js';
import { Database } from './database.js';

/**
 * Exposes the Drizzle database instance to the whole application.
 * The module is global: import it once in `AppModule`, then inject the
 * database anywhere by type.
 *
 * Usage in a service:
 *   constructor(private readonly db: Database) {}
 *   await this.db.select().from(accounts);
 */
@Global()
@Module({
  providers: [
    {
      provide: Database,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env, true>): Database => {
        const connectionString = configService.get(
          'APP_DATABASE_CONNECTION_URL',
          { infer: true },
        );

        return createDatabase(connectionString);
      },
    },
  ],
  exports: [Database],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(private readonly db: Database) {}

  /** Releases the connection pool when the application shuts down. */
  async onModuleDestroy(): Promise<void> {
    await this.db.$client.end();
  }
}
