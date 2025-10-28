import { pageQuerySchema } from 'src/core/utils/page-query';
import { z } from 'zod';

export const demoTestPlayerSchema = z.object({
  name: z.string(),
  age: z.coerce.number(),
  person: z.object({
    name: z.string(),
  }),
});

export type DemoTestPlayerDto = z.infer<typeof demoTestPlayerSchema>;

export const demoGetPaginatedDataSchema = pageQuerySchema.and(
  z
    .object({
      id: z.uuid(),
    })
    .partial(),
);

export type DemoGetPaginatedDataDto = z.infer<
  typeof demoGetPaginatedDataSchema
>;
