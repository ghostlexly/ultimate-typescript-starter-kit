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
