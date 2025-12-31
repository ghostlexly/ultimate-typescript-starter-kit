import { pageQuerySchema } from 'src/core/utils/page-query';
import { z } from 'zod';

export const getCitiesRequestSchema = z.object({
  query: pageQuerySchema.and(
    z
      .object({
        search: z.string(),
      })
      .partial(),
  ),
});

export type GetCitiesRequestDto = z.infer<typeof getCitiesRequestSchema>;
