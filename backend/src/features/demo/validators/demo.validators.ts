import { z } from 'zod';

export const demoTestPlayerSchema = z.object({
  name: z.string(),
  age: z.coerce.number(),
  person: z.object({
    name: z.string(),
  }),
});

export type DemoTestPlayerDto = z.infer<typeof demoTestPlayerSchema>;
