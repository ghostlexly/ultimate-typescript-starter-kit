import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SignInHttpController } from './commands/sign-in/sign-in.http.controller';
import { RefreshTokenHttpController } from './commands/refresh-token/refresh-token.http.controller';
import { ForgotPasswordHttpController } from './commands/forgot-password/forgot-password.http.controller';
import { ResetPasswordHttpController } from './commands/reset-password/reset-password.http.controller';
import { VerifyTokenHttpController } from './commands/verify-token/verify-token.http.controller';
import { SignInService } from './commands/sign-in/sign-in.service';
import { RefreshTokenService } from './commands/refresh-token/refresh-token.service';
import { ForgotPasswordService } from './commands/forgot-password/forgot-password.service';
import { ResetPasswordService } from './commands/reset-password/reset-password.service';
import { VerifyTokenService } from './commands/verify-token/verify-token.service';
import { GetCurrentUserHttpController } from './queries/get-current-user/get-current-user.http.controller';
import { GoogleAuthHttpController } from './queries/google-auth/google-auth.http.controller';
import { GetCurrentUserQueryHandler } from './queries/get-current-user/get-current-user.query-handler';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { ClearExpiredSessionsCron } from './crons/clear-expired-sessions.cron';
import { ClearExpiredVerificationTokensCron } from './crons/clear-expired-verification-tokens.cron';
import { SendPasswordResetEmailHandler } from './application/event-handlers/send-password-reset-email.handler';
import {
  ACCOUNT_REPOSITORY,
  SESSION_REPOSITORY,
  VERIFICATION_TOKEN_REPOSITORY,
} from './domain/ports';
import {
  AccountRepository,
  SessionRepository,
  VerificationTokenRepository,
} from './infrastructure/adapters';

const CommandHandlers = [
  SignInService,
  RefreshTokenService,
  ForgotPasswordService,
  ResetPasswordService,
  VerifyTokenService,
];

const QueryHandlers = [GetCurrentUserQueryHandler];

const EventHandlers = [SendPasswordResetEmailHandler];

const Strategies = [JwtStrategy, GoogleStrategy];

const Crons = [ClearExpiredSessionsCron, ClearExpiredVerificationTokensCron];

const Repositories = [
  {
    provide: ACCOUNT_REPOSITORY,
    useClass: AccountRepository,
  },
  {
    provide: SESSION_REPOSITORY,
    useClass: SessionRepository,
  },
  {
    provide: VERIFICATION_TOKEN_REPOSITORY,
    useClass: VerificationTokenRepository,
  },
];

@Module({
  imports: [
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
  controllers: [
    SignInHttpController,
    RefreshTokenHttpController,
    ForgotPasswordHttpController,
    ResetPasswordHttpController,
    VerifyTokenHttpController,
    GetCurrentUserHttpController,
    GoogleAuthHttpController,
  ],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    ...Strategies,
    ...Crons,
    ...Repositories,
  ],
  exports: [ACCOUNT_REPOSITORY, SESSION_REPOSITORY, VERIFICATION_TOKEN_REPOSITORY],
})
export class AuthModule {}
