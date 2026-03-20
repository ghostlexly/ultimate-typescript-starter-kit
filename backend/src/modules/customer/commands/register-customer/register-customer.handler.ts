import { BadRequestException } from '@nestjs/common';
import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { CustomerService } from '../../customer.service';
import { RegisterCustomerCommand } from './register-customer.command';
import { LoginCodeRequestedEvent } from '../../../auth/events/login-code-requested/login-code-requested.event';

@CommandHandler(RegisterCustomerCommand)
export class RegisterCustomerHandler implements ICommandHandler<RegisterCustomerCommand> {
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ email, country }: RegisterCustomerCommand) {
    const existingCustomer = await this.customerService.verifyExistingEmail({
      email,
    });

    if (existingCustomer) {
      throw new BadRequestException('This email address is already in use.');
    }

    // Create customer account (no password - login via 4-digit code)
    const customer = await this.db.prisma.customer.create({
      include: {
        account: true,
      },
      data: {
        account: {
          create: {
            email,
            role: 'CUSTOMER',
          },
        },

        ...(country ? { countryCode: country } : {}),
      },
    });

    // Generate and send login code
    const loginCode = this.authService.generateLoginCode();

    await this.authService.createLoginCodeToken({
      accountId: customer.account.id,
      code: loginCode,
    });

    this.eventBus.publish(new LoginCodeRequestedEvent({ email, loginCode }));

    return customer;
  }
}
