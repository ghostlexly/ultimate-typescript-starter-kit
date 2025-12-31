import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import crypto from 'crypto';
import { ForgotPasswordCommand } from './forgot-password.command';
import { DatabaseService } from 'src/features/application/services/database.service';
import { dateUtils } from 'src/core/utils/date';
import { PasswordResetRequestedEvent } from '../../domain/events/password-reset-requested.event';

export interface ForgotPasswordResult {
  message: string;
}

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordService
  implements ICommandHandler<ForgotPasswordCommand, ForgotPasswordResult>
{
  constructor(
    private readonly db: DatabaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<ForgotPasswordResult> {
    const account = await this.db.prisma.account.findFirst({
      where: {
        email: {
          equals: command.email,
          mode: 'insensitive',
        },
      },
    });

    if (!account) {
      throw new HttpException(
        { message: 'Account not found.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generate a random password reset token
    const passwordResetToken = crypto.randomInt(100000, 999999).toString();

    // Store the token in the database
    await this.db.prisma.verificationToken.create({
      data: {
        type: 'PASSWORD_RESET',
        token: passwordResetToken,
        accountId: account.id,
        expiresAt: dateUtils.add(new Date(), { hours: 6 }),
      },
    });

    // Fire domain event (email will be sent by event handler)
    this.eventEmitter.emit(
      'auth.password-reset.requested',
      new PasswordResetRequestedEvent({
        aggregateId: account.id,
        email: account.email,
        resetToken: passwordResetToken,
      }),
    );

    return {
      message: 'Password reset email sent successfully.',
    };
  }
}
