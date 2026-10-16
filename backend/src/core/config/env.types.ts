import type { z } from 'zod';
import type { envSchema } from './env.schema.js';

/**
 * Validated environment, as exposed by `ConfigService`.
 *
 * Inject the typed service to get autocompletion and non-nullable values:
 *   constructor(private readonly configService: ConfigService<Env, true>) {}
 *   const port = this.configService.get('APP_PORT', { infer: true });
 */
export type Env = z.infer<typeof envSchema>;
