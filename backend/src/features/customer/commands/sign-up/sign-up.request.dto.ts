import { z } from 'zod';

export const signUpRequestSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export type SignUpRequestDto = z.infer<typeof signUpRequestSchema>;
