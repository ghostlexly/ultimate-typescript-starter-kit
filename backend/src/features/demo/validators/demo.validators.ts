import { pageQuerySchema } from 'src/core/utils/page-query';
import { z } from 'zod';

export const demoTestPlayerSchema = z.object({
  body: z.object({
    name: z.string(),
    age: z.coerce.number(),
    person: z.object({
      name: z.string(),
    }),
  }),
  query: z
    .object({
      id: z.uuid(),
    })
    .partial(),
});
export type DemoTestPlayerDto = z.infer<typeof demoTestPlayerSchema>;

export const demoGetPaginatedDataSchema = z.object({
  query: pageQuerySchema.partial().and(
    z
      .object({
        id: z.uuid(),
      })
      .partial(),
  ),
});
export type DemoGetPaginatedDataDto = z.infer<
  typeof demoGetPaginatedDataSchema
>;
