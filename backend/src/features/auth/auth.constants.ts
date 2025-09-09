export const jwtConstants = {
  privateKey: process.env.APP_JWT_PRIVATE_KEY ?? '!ChangeMe!',
  publicKey: process.env.APP_JWT_PUBLIC_KEY ?? '!ChangeMe!',
};

export const authConstants = {
  accessTokenExpirationMinutes: 15, // 15 minutes
  refreshTokenExpirationMinutes: 60 * 24 * 60, // 60 days
  passwordResetTokenExpirationHours: 1,
};
