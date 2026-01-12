import { z } from 'zod';

export const testPlayerBodySchema = z.object({
  name: z.string(),
  age: z.coerce.number(),
  person: z.object({
    name: z.string(),
  }),
});
export type TestPlayerBodyInput = z.infer<typeof testPlayerBodySchema>;

export const testPlayerQuerySchema = z
  .object({
    id: z.uuid(),
  })
  .partial();
export type TestPlayerQueryInput = z.infer<typeof testPlayerQuerySchema>;
