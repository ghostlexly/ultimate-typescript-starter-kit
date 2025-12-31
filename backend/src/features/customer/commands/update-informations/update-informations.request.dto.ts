import { z } from 'zod';

export const updateInformationsRequestSchema = z.object({
  body: z.object({
    countryCode: z.string().min(2).max(2),
    city: z.string().uuid(),
  }),
});

export type UpdateInformationsRequestDto = z.infer<
  typeof updateInformationsRequestSchema
>;
