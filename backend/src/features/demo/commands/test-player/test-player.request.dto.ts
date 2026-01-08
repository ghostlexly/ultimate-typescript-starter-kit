import { z } from 'zod';

export const demoTestPlayerSchema = z.object({
  body: z.object({
    name: z.string(),
    age: z.coerce.number(),
    person: z.object({
      name: z.string(),
    }),
  }),
  query: z
    .object({
      id: z.uuid(),
    })
    .partial(),
});

export type DemoTestPlayerDto = z.infer<typeof demoTestPlayerSchema>;
