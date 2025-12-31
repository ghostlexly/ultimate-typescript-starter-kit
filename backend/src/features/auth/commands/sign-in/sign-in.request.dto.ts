import { z } from 'zod';

export const signInRequestSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(1),
  }),
});

export type SignInRequestDto = z.infer<typeof signInRequestSchema>;
