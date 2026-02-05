import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './controllers/auth.controller';
import { SignInHandler } from './commands/sign-in/sign-in.handler';
import { RefreshTokenHandler } from './commands/refresh-token/refresh-token.handler';
import { ForgotPasswordHandler } from './commands/forgot-password/forgot-password.handler';
import { VerifyTokenHandler } from './commands/verify-token/verify-token.handler';
import { ResetPasswordHandler } from './commands/reset-password/reset-password.handler';
import { PasswordResetRequestedEventHandler } from './events/password-reset-requested/password-reset-requested.event-handler';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

const CommandHandlers = [
  SignInHandler,
  RefreshTokenHandler,
  ForgotPasswordHandler,
  VerifyTokenHandler,
  ResetPasswordHandler,
];

const QueryHandlers = [];

const EventHandlers = [PasswordResetRequestedEventHandler];

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
  controllers: [AuthController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,

    AuthService,
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
