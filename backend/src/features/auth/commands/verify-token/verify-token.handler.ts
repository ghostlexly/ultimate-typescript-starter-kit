import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { VerifyTokenCommand } from './verify-token.command';
import { AuthService } from '../../auth.service';

@CommandHandler(VerifyTokenCommand)
export class VerifyTokenHandler implements ICommandHandler<VerifyTokenCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute({ type, token, email }: VerifyTokenCommand) {
    const tokenValid = await this.authService.verifyVerificationToken({
      type,
      token,
      email,
    });

    if (!tokenValid) {
      throw new HttpException(
        {
          message: 'This token is not valid or has expired.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: 'Token is valid.',
    };
  }
}
