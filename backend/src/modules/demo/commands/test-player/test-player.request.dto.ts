import { z } from 'zod';

export const testPlayerRequestSchema = z.object({
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

export type TestPlayerRequestDto = z.infer<typeof testPlayerRequestSchema>;
