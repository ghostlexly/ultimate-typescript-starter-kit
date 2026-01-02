import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ResetPasswordCommand } from './reset-password.command';
import { Password } from '../../domain/value-objects';
import {
  ACCOUNT_REPOSITORY,
  VERIFICATION_TOKEN_REPOSITORY,
} from '../../domain/ports';
import type {
  AccountRepositoryPort,
  VerificationTokenRepositoryPort,
} from '../../domain/ports';

export interface ResetPasswordResult {
  message: string;
}

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordService
  implements ICommandHandler<ResetPasswordCommand, ResetPasswordResult>
{
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepositoryPort,
    @Inject(VERIFICATION_TOKEN_REPOSITORY)
    private readonly verificationTokenRepository: VerificationTokenRepositoryPort,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<ResetPasswordResult> {
    // Verify the token via repository
    const verificationToken =
      await this.verificationTokenRepository.findByTokenAndType(
        command.token,
        'PASSWORD_RESET',
        command.email,
      );

    if (!verificationToken?.isValid) {
      throw new HttpException(
        { message: 'This token is not valid or expired.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Find account via repository
    const account = await this.accountRepository.findByEmail(command.email);

    if (!account) {
      throw new HttpException(
        { message: 'Account not found.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Use domain entity to change password (validates business rules)
    const newPassword = Password.create(command.password);
    await account.changePassword(newPassword);

    // Save via repository
    await this.accountRepository.save(account);

    // Delete the verification token via repository
    await this.verificationTokenRepository.deleteByAccountIdAndType(
      account.id,
      'PASSWORD_RESET',
    );

    return {
      message: 'Password reset successfully.',
    };
  }
}
