import { z } from 'zod';
import { updateCustomerInformationsSchema } from './update-customer-informations.schema';

export const updateCustomerInformationsRequestSchema = z.object({
  body: updateCustomerInformationsSchema,
});

export type UpdateCustomerInformationsRequestDto = z.infer<
  typeof updateCustomerInformationsRequestSchema
>;
