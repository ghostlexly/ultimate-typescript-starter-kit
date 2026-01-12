import { z } from 'zod';

export const updateCustomerInformationsRequestSchema = z.object({
  body: z.object({
    countryCode: z.string().min(2).max(2),
    city: z.uuid(),
  }),
});
export type UpdateCustomerInformationsRequestDto = z.infer<
  typeof updateCustomerInformationsRequestSchema
>;
