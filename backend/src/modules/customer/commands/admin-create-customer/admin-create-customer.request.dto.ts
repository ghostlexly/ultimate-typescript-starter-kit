import { z } from 'zod';

export const adminCreateCustomerRequestSchema = z.object({
  body: z.object({
    email: z.email(),
  }),
});

export type AdminCreateCustomerRequestDto = z.infer<
  typeof adminCreateCustomerRequestSchema
>;
