import { z } from 'zod';

// Body is optional since refreshToken can come from cookies
export const refreshTokenRequestSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(1).optional(),
    })
    .optional(),
});

export type RefreshTokenRequestDto = z.infer<typeof refreshTokenRequestSchema>;
