import { EventBus } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import crypto from 'node:crypto';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { dateUtils } from 'src/modules/core/utils/date';
import { PasswordResetRequestedEvent } from '../../events/password-reset-requested/password-reset-requested.event';

@Injectable()
export class ForgotPasswordHandler {
  constructor(
    private readonly db: DatabaseService,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ email }: { email: string }) {
    const account = await this.db.prisma.account.findFirst({
      where: {
        email: {
          contains: email,
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
