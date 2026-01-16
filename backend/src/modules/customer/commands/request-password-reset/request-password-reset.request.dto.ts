import { z } from 'zod';
import { requestPasswordResetSchema } from './request-password-reset.schema';

export const requestPasswordResetRequestSchema = z.object({
  body: requestPasswordResetSchema,
});

export type RequestPasswordResetRequestDto = z.infer<
  typeof requestPasswordResetRequestSchema
>;
