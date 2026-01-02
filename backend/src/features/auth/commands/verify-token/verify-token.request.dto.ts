import { VerificationType } from 'src/generated/prisma/enums';
import { z } from 'zod';

export const verifyTokenRequestSchema = z.object({
  body: z.object({
    type: z.enum(VerificationType),
    token: z.string().min(1),
    email: z.email(),
  }),
});

export type VerifyTokenRequestDto = z.infer<typeof verifyTokenRequestSchema>;
