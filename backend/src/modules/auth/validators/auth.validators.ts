import { Role } from "@prisma/client";
import { z } from "zod";

export const authSigninValidator = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
    role: z.nativeEnum(Role),
  }),
});

export type AuthSigninValidator = z.infer<typeof authSigninValidator>;

export const authRefreshTokenValidator = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export type AuthRefreshTokenValidator = z.infer<
  typeof authRefreshTokenValidator
>;
