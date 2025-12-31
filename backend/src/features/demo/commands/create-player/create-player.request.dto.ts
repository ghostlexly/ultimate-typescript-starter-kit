import { z } from 'zod';

export const createPlayerRequestSchema = z.object({
  body: z.object({
    name: z.string(),
    age: z.coerce.number(),
    person: z.object({
      name: z.string(),
    }),
  }),
  query: z
    .object({
      id: z.string().uuid(),
    })
    .partial(),
});

export type CreatePlayerRequestDto = z.infer<typeof createPlayerRequestSchema>;
