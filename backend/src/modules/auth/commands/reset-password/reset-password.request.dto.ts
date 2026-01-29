import { z } from 'zod';

export const resetPasswordRequestSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8).max(100),
    token: z.string().min(1),
  }),
});

export type ResetPasswordRequestDto = z.infer<typeof resetPasswordRequestSchema>;
