import { z } from 'zod';

export const getAllCountriesRequestSchema = z.object({
  query: z.object({
    language: z.string().min(2).max(5).default('fr'),
  }),
});
export type GetAllCountriesRequestDto = z.infer<
  typeof getAllCountriesRequestSchema
>;
