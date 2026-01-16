import { z } from 'zod';

export const registerCustomerSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100),
  country: z.string().min(1),
});

export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;
