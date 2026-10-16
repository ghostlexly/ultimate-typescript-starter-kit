import { pgEnum } from 'drizzle-orm/pg-core';

/** Purpose of a verification token. */
export const verificationTypeEnum = pgEnum('verification_type', [
  'PASSWORD_RESET',
  'EMAIL_VERIFICATION',
  'TWO_FACTOR',
  'LOGIN_CODE',
]);
