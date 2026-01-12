import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import crypto from 'node:crypto';
import { ForgotPasswordCommand } from './forgot-password.command';
import { DatabaseService } from 'src/features/application/services/database.service';
import { dateUtils } from 'src/core/utils/date';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler
  implements ICommandHandler<ForgotPasswordCommand>
{
  constructor(private readonly db: DatabaseService) {}

  async execute({ data }: ForgotPasswordCommand) {
    const account = await this.db.prisma.account.findFirst({
      where: {
        email: {
          contains: data.email,
          mode: 'insensitive',
        },
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

    // Generate a random password reset token
    const passwordResetToken = crypto.randomInt(100000, 999999).toString();

    // Store the token in the database (e.g., in a password_reset_tokens table)
    await this.db.prisma.verificationToken.create({
      data: {
        type: 'PASSWORD_RESET',
        token: passwordResetToken,
        accountId: account.id,
        expiresAt: dateUtils.add(new Date(), { hours: 6 }),
      },
    });

    // Send the password reset email
    // await this.brevoService.sendEmailTemplate({
    //   toEmail: account.email,
    //   templateId: 275,
    //   subject: 'Demande de réinitialisation de votre mot de passe',
    //   templateParams: {
    //     passwordResetToken,
    //   },
    // });

    return {
      message: 'Password reset email sent successfully.',
    };
  }
}
