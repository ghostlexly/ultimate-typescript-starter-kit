import { z } from 'zod';

export const verifyCodeRequestSchema = z.object({
  body: z.object({
    email: z.email(),
    code: z.string().length(4),
  }),
});

export type VerifyCodeRequestDto = z.infer<typeof verifyCodeRequestSchema>;