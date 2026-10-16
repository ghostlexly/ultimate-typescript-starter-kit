import { z } from 'zod';

/**
 * Shape of the environment variables the application relies on.
 *
 * Only variables consumed by the current code base are listed: add a new
 * entry here before reading it from `ConfigService`, so a missing or
 * malformed value fails at startup instead of deep inside a request.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  // -- App
  APP_PORT: z.coerce.number().int().positive().default(3000),
  APP_BASE_URL: z.url().optional(),

  // -- Database
  APP_DATABASE_CONNECTION_URL: z
    .string()
    .min(1, 'APP_DATABASE_CONNECTION_URL is required'),

  // -- Redis
  APP_REDIS_HOST: z.string().default('localhost'),
  APP_REDIS_PORT: z.coerce.number().int().positive().default(6379),
});
