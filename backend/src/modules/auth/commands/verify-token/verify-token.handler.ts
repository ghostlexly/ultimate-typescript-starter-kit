import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyTokenCommand } from './verify-token.command';
import { AuthService } from '../../auth.service';

@CommandHandler(VerifyTokenCommand)
export class VerifyTokenHandler implements ICommandHandler<VerifyTokenCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: VerifyTokenCommand) {
    return await this.authService.verifyVerificationToken({
      type: command.type,
      token: command.token,
      email: command.email,
    });
  }
}
