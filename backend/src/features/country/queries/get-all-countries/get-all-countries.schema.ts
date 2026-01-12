import { z } from 'zod';

export const getAllCountriesSchema = z.object({
  language: z.string().min(2).max(5).default('fr'),
});

export type GetAllCountriesInput = z.infer<typeof getAllCountriesSchema>;
