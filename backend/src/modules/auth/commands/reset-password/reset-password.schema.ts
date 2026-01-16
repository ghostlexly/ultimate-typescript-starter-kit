import { z } from 'zod';

export const resetPasswordSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100),
  token: z.string().min(1),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
