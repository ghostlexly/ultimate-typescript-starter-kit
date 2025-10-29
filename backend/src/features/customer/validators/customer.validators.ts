import { z } from 'zod';

export const customerRegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100),
  country: z.string().min(1),
});

export type CustomerRegisterDto = z.infer<typeof customerRegisterSchema>;

export const customerRequestPasswordResetTokenSchema = z.object({
  email: z.email(),
});

export type CustomerRequestPasswordResetTokenDto = z.infer<
  typeof customerRequestPasswordResetTokenSchema
>;

export const customerResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6).max(100),
});

export type CustomerResetPasswordDto = z.infer<
  typeof customerResetPasswordSchema
>;
