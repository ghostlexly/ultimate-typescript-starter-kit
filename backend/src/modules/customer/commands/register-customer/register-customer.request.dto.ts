import { z } from 'zod';
import { registerCustomerSchema } from './register-customer.schema';

export const registerCustomerRequestSchema = z.object({
  body: registerCustomerSchema,
});

export type RegisterCustomerRequestDto = z.infer<
  typeof registerCustomerRequestSchema
>;
