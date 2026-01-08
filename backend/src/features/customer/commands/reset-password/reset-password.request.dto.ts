import { z } from 'zod';

export const resetPasswordRequestSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(100),
  }),
});

export type ResetPasswordRequestDto = z.infer<typeof resetPasswordRequestSchema>;
