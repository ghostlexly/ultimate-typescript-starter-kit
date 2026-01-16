import { z } from 'zod';
import { signInSchema } from './sign-in.schema';

export const signInRequestSchema = z.object({
  body: signInSchema,
});

export type SignInRequestDto = z.infer<typeof signInRequestSchema>;
