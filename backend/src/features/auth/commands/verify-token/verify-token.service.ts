import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { VerifyTokenCommand } from './verify-token.command';
import { VERIFICATION_TOKEN_REPOSITORY } from '../../domain/ports';
import type { VerificationTokenRepositoryPort } from '../../domain/ports';

export interface VerifyTokenResult {
  message: string;
}

@CommandHandler(VerifyTokenCommand)
export class VerifyTokenService
  implements ICommandHandler<VerifyTokenCommand, VerifyTokenResult>
{
  constructor(
    @Inject(VERIFICATION_TOKEN_REPOSITORY)
    private readonly verificationTokenRepository: VerificationTokenRepositoryPort,
  ) {}

  async execute(command: VerifyTokenCommand): Promise<VerifyTokenResult> {
    const verificationToken =
      await this.verificationTokenRepository.findByTokenAndType(
        command.token,
        command.type,
        command.email,
      );

    if (!verificationToken || !verificationToken.isValid) {
      throw new HttpException(
        { message: 'This token is not valid or has expired.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: 'Token is valid.',
    };
  }
}
