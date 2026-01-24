import { z } from 'zod';

export const registerCustomerRequestSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8).max(100),
    country: z.string().min(1),
  }),
});

export type RegisterCustomerRequestDto = z.infer<
  typeof registerCustomerRequestSchema
>;
