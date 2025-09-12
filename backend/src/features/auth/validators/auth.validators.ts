import { Role } from 'src/generated/prisma/client';
import { z } from 'zod';

export const authSigninSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  role: z.enum(Role),
});

export type AuthSigninDto = z.infer<typeof authSigninSchema>;

export const authRefreshTokenSchema = z
  .object({
    refreshToken: z.string().min(1).optional(),
  })
  .optional();

export type AuthRefreshTokenDto = z.infer<typeof authRefreshTokenSchema>;
