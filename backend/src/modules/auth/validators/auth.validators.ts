import { Role } from "@prisma/client";
import { z } from "zod";

export const authOnSigninValidator = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
    role: z.nativeEnum(Role),
  }),
});

export type AuthOnSigninValidator = z.infer<typeof authOnSigninValidator>;

export const authOnRefreshTokenValidator = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export type AuthOnRefreshTokenValidator = z.infer<
  typeof authOnRefreshTokenValidator
>;
