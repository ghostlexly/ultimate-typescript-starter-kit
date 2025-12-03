import { VerificationType } from 'src/generated/prisma/enums';
import { z } from 'zod';

export const authSigninSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(1),
  }),
});
export type AuthSigninDto = z.infer<typeof authSigninSchema>;

export const authRefreshTokenSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(1).optional(),
    })
    .optional(),
});
export type AuthRefreshTokenDto = z.infer<typeof authRefreshTokenSchema>;

export const authForgotPasswordSchema = z.object({
  body: z.object({
    email: z.email(),
  }),
});
export type AuthForgotPasswordDto = z.infer<typeof authForgotPasswordSchema>;

export const authVerifyTokenSchema = z.object({
  body: z.object({
    type: z.enum(VerificationType),
    token: z.string().min(1),
    email: z.email(),
  }),
});
export type AuthVerifyTokenDto = z.infer<typeof authVerifyTokenSchema>;

export const authResetPasswordSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8).max(100),
    token: z.string().min(1),
  }),
});
export type AuthResetPasswordDto = z.infer<typeof authResetPasswordSchema>;
