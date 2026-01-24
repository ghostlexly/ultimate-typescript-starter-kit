import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RegisterCustomerCommand } from './register-customer.command';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { CustomerService } from '../../customer.service';

@CommandHandler(RegisterCustomerCommand)
export class RegisterCustomerHandler
  implements ICommandHandler<RegisterCustomerCommand>
{
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
  ) {}

  async execute(command: RegisterCustomerCommand) {
    const existingCustomer = await this.customerService.verifyExistingEmail({
      email: command.email,
    });

    if (existingCustomer) {
      throw new HttpException(
        {
          message: 'Cette adresse e-mail est déjà utilisée.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await this.authService.hashPassword({
      password: command.password,
    });

    return this.db.prisma.account.create({
      data: {
        email: command.email,
        password: hashedPassword,
        role: 'CUSTOMER',
        customer: {
          create: {},
        },
      },
    });
  }
}
