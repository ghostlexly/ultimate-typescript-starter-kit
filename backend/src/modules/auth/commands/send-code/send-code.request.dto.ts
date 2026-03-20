import { z } from 'zod';

export const sendCodeRequestSchema = z.object({
  body: z.object({
    email: z.email(),
  }),
});

export type SendCodeRequestDto = z.infer<typeof sendCodeRequestSchema>;