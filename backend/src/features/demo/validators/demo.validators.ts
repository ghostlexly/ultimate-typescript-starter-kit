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
  query: pageQuerySchema.and(
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
