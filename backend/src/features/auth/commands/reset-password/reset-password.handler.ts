import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ResetPasswordCommand } from './reset-password.command';
import { DatabaseService } from 'src/features/application/services/database.service';
import { AuthService } from '../../auth.service';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler
  implements ICommandHandler<ResetPasswordCommand>
{
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  async execute({ email, password, token }: ResetPasswordCommand) {
    const tokenValid = await this.authService.verifyVerificationToken({
      type: 'PASSWORD_RESET',
      token,
      email,
    });

    if (!tokenValid) {
      throw new HttpException(
        {
          message: 'This token is not valid or expired.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const account = await this.db.prisma.account.findFirst({
      where: {
        email,
      },
    });

    if (!account) {
      throw new HttpException(
        {
          message: 'Account not found.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await this.authService.hashPassword({
      password,
    });

    // Update the account password
    await this.db.prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Delete the verification token
    await this.db.prisma.verificationToken.deleteMany({
      where: {
        accountId: account.id,
        type: 'PASSWORD_RESET',
      },
    });

    return {
      message: 'Password reset successfully.',
    };
  }
}
