import { pageQuerySchema } from 'src/core/utils/page-query';
import { z } from 'zod';

export const demoGetPaginatedDataSchema = z.object({
  query: pageQuerySchema.and(
    z
      .object({
        id: z.uuid(),
      })
      .partial(),
  ),
});

export type DemoGetPaginatedDataDto = z.infer<typeof demoGetPaginatedDataSchema>;
