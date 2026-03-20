import { BadRequestException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { AuthService } from '../../auth.service';
import { VerifyCodeCommand } from './verify-code.command';

@CommandHandler(VerifyCodeCommand)
export class VerifyCodeHandler implements ICommandHandler<VerifyCodeCommand> {
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  async execute({ email, code }: VerifyCodeCommand) {
    const result = await this.authService.verifyLoginCode({ email, code });

    if (!result.isValid) {
      if (result.isMaxAttemptsReached) {
        throw new BadRequestException({
          message: 'Maximum attempts reached. Please request a new code.',
          isMaxAttemptsReached: true,
        });
      }

      throw new BadRequestException({
        message:
          result.remainingAttempts > 0
            ? `Incorrect code. ${result.remainingAttempts} attempt(s) remaining.`
            : 'Invalid or expired code.',
        remainingAttempts: result.remainingAttempts,
      });
    }

    // Create a new session
    const session = await this.authService.createSession({
      accountId: result.accountId!,
    });

    // Generate authentication tokens
    const { accessToken, refreshToken } =
      await this.authService.generateAuthenticationTokens({
        sessionId: session.id,
      });

    // Get the account role for frontend redirect
    const account = await this.db.prisma.account.findUnique({
      where: { id: result.accountId! },
    });

    return {
      role: account!.role,
      accessToken,
      refreshToken,
    };
  }
}