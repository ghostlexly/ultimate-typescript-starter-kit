import { z } from 'zod';

export const updateCustomerInformationsSchema = z.object({
  countryCode: z.string().min(2).max(2),
  city: z.uuid(),
});

export type UpdateCustomerInformationsInput = z.infer<
  typeof updateCustomerInformationsSchema
>;
