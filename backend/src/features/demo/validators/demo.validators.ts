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

export const demoGetPaginatedCountriesSchema = z.object({
  query: pageQuerySchema.and(
    z
      .object({
        countryName: z.string().optional(),
      })
      .partial(),
  ),
});
export type DemoGetPaginatedCountriesDto = z.infer<
  typeof demoGetPaginatedCountriesSchema
>;
