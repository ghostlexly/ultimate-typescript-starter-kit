import { z } from 'zod';
import { forgotPasswordSchema } from './forgot-password.schema';

export const forgotPasswordRequestSchema = z.object({
  body: forgotPasswordSchema,
});

export type ForgotPasswordRequestDto = z.infer<
  typeof forgotPasswordRequestSchema
>;
