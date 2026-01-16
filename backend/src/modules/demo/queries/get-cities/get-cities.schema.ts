import { pageQuerySchema } from 'src/modules/core/utils/page-query';
import { z } from 'zod';

export const getCitiesSchema = pageQuerySchema.and(
  z
    .object({
      search: z.string(),
    })
    .partial(),
);

export type GetCitiesInput = z.infer<typeof getCitiesSchema>;
