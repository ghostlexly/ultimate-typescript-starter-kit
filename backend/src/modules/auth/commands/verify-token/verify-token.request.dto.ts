import { z } from 'zod';
import { verifyTokenSchema } from './verify-token.schema';

export const verifyTokenRequestSchema = z.object({
  body: verifyTokenSchema,
});

export type VerifyTokenRequestDto = z.infer<typeof verifyTokenRequestSchema>;
