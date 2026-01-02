import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignInController } from './commands/sign-in/sign-in.http.controller';
import { SignInHandler } from './commands/sign-in/sign-in.handler';
import { RefreshTokenController } from './commands/refresh-token/refresh-token.http.controller';
import { RefreshTokenHandler } from './commands/refresh-token/refresh-token.handler';
import { ForgotPasswordController } from './commands/forgot-password/forgot-password.http.controller';
import { ForgotPasswordHandler } from './commands/forgot-password/forgot-password.handler';
import { VerifyTokenController } from './commands/verify-token/verify-token.http.controller';
import { VerifyTokenHandler } from './commands/verify-token/verify-token.handler';
import { ResetPasswordController } from './commands/reset-password/reset-password.http.controller';
import { ResetPasswordHandler } from './commands/reset-password/reset-password.handler';
import { GetCurrentUserController } from './queries/get-current-user/get-current-user.http.controller';
import { GetCurrentUserQueryHandler } from './queries/get-current-user/get-current-user.query-handler';
import { GoogleOAuthController } from './controllers/google-oauth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { ClearExpiredSessionsCron } from './crons/clear-expired-sessions.cron';
import { ClearExpiredVerificationTokensCron } from './crons/clear-expired-verification-tokens.cron';

const CommandHandlers = [
  SignInHandler,
  RefreshTokenHandler,
  ForgotPasswordHandler,
  VerifyTokenHandler,
  ResetPasswordHandler,
];

const QueryHandlers = [GetCurrentUserQueryHandler];

const Controllers = [
  SignInController,
  RefreshTokenController,
  ForgotPasswordController,
  VerifyTokenController,
  ResetPasswordController,
  GetCurrentUserController,
  GoogleOAuthController,
];

@Module({
  imports: [
    CqrsModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        privateKey: Buffer.from(
          configService.getOrThrow<string>('APP_JWT_PRIVATE_KEY'),
          'base64',
        ).toString('utf8'),
        publicKey: Buffer.from(
          configService.getOrThrow<string>('APP_JWT_PUBLIC_KEY'),
          'base64',
        ).toString('utf8'),
        signOptions: { algorithm: 'RS256' },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  controllers: Controllers,
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    ClearExpiredSessionsCron,
    ClearExpiredVerificationTokensCron,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [AuthService],
})
export class AuthModule {}
