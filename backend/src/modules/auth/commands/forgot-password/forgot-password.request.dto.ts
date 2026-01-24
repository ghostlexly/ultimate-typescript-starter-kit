import { z } from 'zod';

export const forgotPasswordRequestSchema = z.object({
  body: z.object({
    email: z.email(),
  }),
});

export type ForgotPasswordRequestDto = z.infer<
  typeof forgotPasswordRequestSchema
>;
