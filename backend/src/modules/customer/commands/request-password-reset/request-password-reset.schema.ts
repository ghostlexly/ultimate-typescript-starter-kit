import { z } from 'zod';

export const requestPasswordResetSchema = z.object({
  email: z.email(),
});

export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>;
