export const authConstants = {
  accessTokenExpirationMinutes: 15, // 15 minutes
  refreshTokenExpirationMinutes: 60 * 24 * 60, // 60 days
  loginCodeExpirationMinutes: 15, // 15 minutes
  loginCodeMaxAttempts: 5, // max failed attempts before code is invalidated
  loginCodeCooldownSeconds: 60, // minimum time between code sends
};