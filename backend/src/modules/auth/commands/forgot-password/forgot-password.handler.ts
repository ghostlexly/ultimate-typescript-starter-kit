import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import crypto from 'node:crypto';
import { ForgotPasswordCommand } from './forgot-password.command';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { dateUtils } from 'src/modules/core/utils/date';
import { PasswordResetRequestedEvent } from '../../events/password-reset-requested/password-reset-requested.event';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler
  implements ICommandHandler<ForgotPasswordCommand>
{
  constructor(
    private readonly db: DatabaseService,
    private readonly eventBus: EventBus,
  ) {}

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

    const passwordResetToken = crypto.randomInt(100000, 999999).toString();

    await this.db.prisma.verificationToken.create({
      data: {
        type: 'PASSWORD_RESET',
        token: passwordResetToken,
        accountId: account.id,
        expiresAt: dateUtils.add(new Date(), { hours: 6 }),
      },
    });

    this.eventBus.publish(
      new PasswordResetRequestedEvent({
        email: account.email,
        token: passwordResetToken,
      }),
    );

    return {
      message: 'Password reset email sent successfully.',
    };
  }
}
