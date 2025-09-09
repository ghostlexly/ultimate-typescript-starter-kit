import { z } from 'zod';

export const demosTestPlayerSchema = z.object({
  name: z.string(),
  age: z.coerce.number(),
  person: z.object({
    name: z.string(),
  }),
});

export type DemosTestPlayerDto = z.infer<typeof demosTestPlayerSchema>;
