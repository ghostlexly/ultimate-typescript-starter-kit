import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { CustomerService } from '../../customer.service';

@Injectable()
export class RegisterCustomerHandler {
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
  ) {}

  async execute({ email, password }: { email: string; password: string }) {
    const existingCustomer = await this.customerService.verifyExistingEmail({
      email: email,
    });

    if (existingCustomer) {
      throw new BadRequestException('Cette adresse e-mail est déjà utilisée.');
    }

    const hashedPassword = await this.authService.hashPassword({
      password: password,
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
