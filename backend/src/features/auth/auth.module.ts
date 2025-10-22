import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './auth.constants';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ClearExpiredSessionsCron } from './crons/clear-expired-sessions.cron';

@Module({
  imports: [
    JwtModule.register({
      privateKey: Buffer.from(jwtConstants.privateKey, 'base64').toString(
        'utf8',
      ),
      publicKey: jwtConstants.publicKey,
      signOptions: { algorithm: 'RS256' },
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ClearExpiredSessionsCron],
  exports: [AuthService],
})
export class AuthModule {}
