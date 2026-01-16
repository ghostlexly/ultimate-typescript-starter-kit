import { z } from 'zod';
import { getPaginatedDataSchema } from './get-paginated-data.schema';

export const demoGetPaginatedDataSchema = z.object({
  query: getPaginatedDataSchema,
});

export type DemoGetPaginatedDataDto = z.infer<
  typeof demoGetPaginatedDataSchema
>;
