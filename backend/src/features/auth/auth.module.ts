import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { ClearExpiredSessionsCron } from './crons/clear-expired-sessions.cron';
import { ConfigService } from '@nestjs/config';
import { ClearExpiredVerificationTokensCron } from './crons/clear-expired-verification-tokens.cron';

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
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    ClearExpiredSessionsCron,
    ClearExpiredVerificationTokensCron,
  ],
  exports: [AuthService],
})
export class AuthModule {}
