import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './controllers/auth.controller';
import { SendCodeHandler } from './commands/send-code/send-code.handler';
import { VerifyCodeHandler } from './commands/verify-code/verify-code.handler';
import { RefreshTokenHandler } from './commands/refresh-token/refresh-token.handler';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { LoginCodeRequestedEventHandler } from './events/login-code-requested/login-code-requested.event-handler';

const CommandHandlers = [SendCodeHandler, VerifyCodeHandler, RefreshTokenHandler];

const QueryHandlers = [];

const EventHandlers = [LoginCodeRequestedEventHandler];

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
