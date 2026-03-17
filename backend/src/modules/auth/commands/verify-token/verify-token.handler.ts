import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../../auth.service';
import { VerifyTokenCommand } from './verify-token.command';

@CommandHandler(VerifyTokenCommand)
export class VerifyTokenHandler implements ICommandHandler<VerifyTokenCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute({ type, token, email }: VerifyTokenCommand) {
    return await this.authService.verifyVerificationToken({
      type: type,
      token: token,
      email: email,
    });
  }
}
