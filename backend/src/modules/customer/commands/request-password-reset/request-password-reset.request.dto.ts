import { z } from 'zod';

export const requestPasswordResetRequestSchema = z.object({
  body: z.object({
    email: z.email(),
  }),
});

export type RequestPasswordResetRequestDto = z.infer<
  typeof requestPasswordResetRequestSchema
>;
