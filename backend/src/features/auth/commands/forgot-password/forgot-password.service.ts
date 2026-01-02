import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import crypto from 'crypto';
import { ForgotPasswordCommand } from './forgot-password.command';
import { dateUtils } from 'src/core/utils/date';
import { VerificationToken } from '../../domain/entities';
import {
  ACCOUNT_REPOSITORY,
  VERIFICATION_TOKEN_REPOSITORY,
} from '../../domain/ports';
import type {
  AccountRepositoryPort,
  VerificationTokenRepositoryPort,
} from '../../domain/ports';

export interface ForgotPasswordResult {
  message: string;
}

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordService
  implements ICommandHandler<ForgotPasswordCommand, ForgotPasswordResult>
{
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepositoryPort,
    @Inject(VERIFICATION_TOKEN_REPOSITORY)
    private readonly verificationTokenRepository: VerificationTokenRepositoryPort,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<ForgotPasswordResult> {
    const account = await this.accountRepository.findByEmail(command.email);

    if (!account) {
      throw new HttpException(
        { message: 'Account not found.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generate a random password reset token
    const passwordResetToken = crypto.randomInt(100000, 999999).toString();

    // Create verification token entity
    const verificationToken = VerificationToken.create({
      id: crypto.randomUUID(),
      token: passwordResetToken,
      type: 'PASSWORD_RESET',
      accountId: account.id,
      expiresAt: dateUtils.add(new Date(), { hours: 6 }),
    });

    // Store the token
    await this.verificationTokenRepository.save(verificationToken);

    // Domain entity validates business rules and emits event
    account.requestPasswordReset(passwordResetToken);

    // Repository publishes domain events after save
    await this.accountRepository.save(account);

    return {
      message: 'Password reset email sent successfully.',
    };
  }
}
