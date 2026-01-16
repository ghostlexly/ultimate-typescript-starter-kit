import { z } from 'zod';
import { testPlayerBodySchema, testPlayerQuerySchema } from './test-player.schema';

export const testPlayerRequestSchema = z.object({
  body: testPlayerBodySchema,
  query: testPlayerQuerySchema,
});

export type TestPlayerRequestDto = z.infer<typeof testPlayerRequestSchema>;
