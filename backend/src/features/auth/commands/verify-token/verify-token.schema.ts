import { VerificationType } from 'src/generated/prisma/enums';
import { z } from 'zod';

export const verifyTokenSchema = z.object({
  type: z.enum(VerificationType),
  token: z.string().min(1),
  email: z.email(),
});

export type VerifyTokenInput = z.infer<typeof verifyTokenSchema>;
