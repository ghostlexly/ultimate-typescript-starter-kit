import { z } from 'zod';
import { resetPasswordSchema } from './reset-password.schema';

export const resetPasswordRequestSchema = z.object({
  body: resetPasswordSchema,
});

export type ResetPasswordRequestDto = z.infer<typeof resetPasswordRequestSchema>;
