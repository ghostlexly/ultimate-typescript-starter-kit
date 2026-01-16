import { z } from 'zod';
import { getCitiesSchema } from './get-cities.schema';

export const getCitiesRequestSchema = z.object({
  query: getCitiesSchema,
});

export type GetCitiesRequestDto = z.infer<typeof getCitiesRequestSchema>;
