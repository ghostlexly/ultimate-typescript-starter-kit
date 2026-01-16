import { z } from 'zod';
import { getAllCountriesSchema } from './get-all-countries.schema';

export const getAllCountriesRequestSchema = z.object({
  query: getAllCountriesSchema,
});

export type GetAllCountriesRequestDto = z.infer<
  typeof getAllCountriesRequestSchema
>;
