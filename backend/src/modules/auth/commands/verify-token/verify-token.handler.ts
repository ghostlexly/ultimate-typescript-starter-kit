import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { VerifyTokenCommand } from './verify-token.command';
import { AuthService } from '../../auth.service';

@CommandHandler(VerifyTokenCommand)
export class VerifyTokenHandler implements ICommandHandler<VerifyTokenCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute({ data }: VerifyTokenCommand) {
    const tokenValid = await this.authService.verifyVerificationToken({
      type: data.type,
      token: data.token,
      email: data.email,
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
