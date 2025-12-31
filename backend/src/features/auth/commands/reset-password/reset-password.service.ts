import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ResetPasswordCommand } from './reset-password.command';
import { DatabaseService } from 'src/features/application/services/database.service';
import { Password } from '../../domain/value-objects';

export interface ResetPasswordResult {
  message: string;
}

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordService
  implements ICommandHandler<ResetPasswordCommand, ResetPasswordResult>
{
  constructor(private readonly db: DatabaseService) {}

  async execute(command: ResetPasswordCommand): Promise<ResetPasswordResult> {
    // Create value objects
    const hashedPassword = await Password.create(command.password).hash();

    // Verify the token
    const tokenFound = await this.db.prisma.verificationToken.findFirst({
      where: {
        token: command.token,
        type: 'PASSWORD_RESET',
        account: {
          email: command.email,
        },
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!tokenFound) {
      throw new HttpException(
        { message: 'This token is not valid or expired.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Find account
    const account = await this.db.prisma.account.findFirst({
      where: { email: command.email },
    });

    if (!account) {
      throw new HttpException(
        { message: 'Account not found.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update the account password
    await this.db.prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword.value },
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
