import { z } from 'zod';

export const getCountriesRequestSchema = z.object({
  query: z.object({
    language: z.string().min(2).max(5).optional().default('fr'),
  }),
});

export type GetCountriesRequestDto = z.infer<typeof getCountriesRequestSchema>;
