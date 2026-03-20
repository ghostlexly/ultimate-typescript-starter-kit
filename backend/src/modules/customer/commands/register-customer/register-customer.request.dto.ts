import { z } from 'zod';

export const registerCustomerRequestSchema = z.object({
  body: z.object({
    email: z.email(),
    country: z.string().min(1).optional(),
  }),
});

export type RegisterCustomerRequestDto = z.infer<typeof registerCustomerRequestSchema>;