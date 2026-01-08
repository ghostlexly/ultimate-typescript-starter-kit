import { pageQuerySchema } from 'src/core/utils/page-query';
import { z } from 'zod';

export const demoGetCitiesSchema = z.object({
  query: pageQuerySchema.and(
    z
      .object({
        search: z.string(),
      })
      .partial(),
  ),
});

export type DemoGetCitiesDto = z.infer<typeof demoGetCitiesSchema>;
