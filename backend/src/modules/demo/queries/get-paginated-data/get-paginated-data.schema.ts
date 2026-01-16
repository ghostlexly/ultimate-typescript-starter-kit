import { pageQuerySchema } from 'src/modules/core/utils/page-query';
import { z } from 'zod';

export const getPaginatedDataSchema = pageQuerySchema.and(
  z
    .object({
      id: z.uuid(),
    })
    .partial(),
);

export type GetPaginatedDataInput = z.infer<typeof getPaginatedDataSchema>;
