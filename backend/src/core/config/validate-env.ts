import { z } from 'zod';
import { envSchema } from './env.schema.js';
import type { Env } from './env.types.js';

/**
 * `validate` hook of `ConfigModule.forRoot`.
 *
 * Parses the merged environment (process.env + .env files) against
 * `envSchema`. Returns the coerced values (numbers, defaults) so that
 * `ConfigService.get` yields typed data, or throws a readable error listing
 * every invalid variable so the application refuses to boot.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const details = z.prettifyError(result.error);

    throw new Error(`Invalid environment variables:\n${details}`);
  }

  return result.data;
}
