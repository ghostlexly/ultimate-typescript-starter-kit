import { z } from 'zod';

export const refreshTokenRequestSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(1).optional(),
    })
    .optional(),
});
export type RefreshTokenRequestDto = z.infer<typeof refreshTokenRequestSchema>;
