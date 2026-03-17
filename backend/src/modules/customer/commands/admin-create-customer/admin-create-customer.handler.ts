import { BadRequestException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { CustomerService } from '../../customer.service';
import { AdminCreateCustomerCommand } from './admin-create-customer.command';

@CommandHandler(AdminCreateCustomerCommand)
export class AdminCreateCustomerHandler
  implements ICommandHandler<AdminCreateCustomerCommand>
{
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
  ) {}

  async execute({ email }: AdminCreateCustomerCommand) {
    const existingCustomer = await this.customerService.verifyExistingEmail({
      email: email,
    });

    if (existingCustomer) {
      throw new BadRequestException('Cette adresse e-mail est déjà utilisée.');
    }

    const hashedPassword = await this.authService.hashPassword({
      password: 'admin1234',
    });

    return this.db.prisma.account.create({
      data: {
        email: email,
        password: hashedPassword,
        role: 'CUSTOMER',
        customer: {
          create: {},
        },
      },
    });
  }
}
