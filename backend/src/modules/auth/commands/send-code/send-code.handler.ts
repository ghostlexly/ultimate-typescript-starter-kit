import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { AuthService } from '../../auth.service';
import { SendCodeCommand } from './send-code.command';
import { LoginCodeRequestedEvent } from '../../events/login-code-requested/login-code-requested.event';

@CommandHandler(SendCodeCommand)
export class SendCodeHandler implements ICommandHandler<SendCodeCommand> {
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ email }: SendCodeCommand) {
    // Find account by email
    const account = await this.db.prisma.account.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

    if (!account) {
      throw new BadRequestException('No account found with this email address.');
    }

    // Check cooldown (prevent code flooding)
    const cooldownRemaining = await this.authService.getLoginCodeCooldownRemaining({
      accountId: account.id,
    });

    if (cooldownRemaining > 0) {
      throw new HttpException(
        {
          message: `Please wait ${cooldownRemaining} second(s) before requesting a new code.`,
          cooldownRemaining,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Generate a 4-digit login code
    const loginCode = this.authService.generateLoginCode();

    // Store the code in the database (deletes previous codes)
    await this.authService.createLoginCodeToken({
      accountId: account.id,
      code: loginCode,
    });

    // Send the login code via email
    this.eventBus.publish(
      new LoginCodeRequestedEvent({ email: account.email, loginCode: loginCode }),
    );

    return {
      message: 'Login code sent successfully.',
    };
  }
}
