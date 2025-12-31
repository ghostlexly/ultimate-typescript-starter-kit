import { pageQuerySchema } from 'src/core/utils/page-query';
import { z } from 'zod';

export const getPaginatedDataRequestSchema = z.object({
  query: pageQuerySchema.and(
    z
      .object({
        id: z.string().uuid(),
      })
      .partial(),
  ),
});

export type GetPaginatedDataRequestDto = z.infer<
  typeof getPaginatedDataRequestSchema
>;
