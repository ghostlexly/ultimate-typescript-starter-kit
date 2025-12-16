import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../application/services/database.service';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class UsersSeeder {
  private readonly logger = new Logger(UsersSeeder.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  async seed(): Promise<void> {
    this.logger.debug('Seeding users...');

    await this.seedAdmin();
    await this.seedCustomer();

    this.logger.debug(`Users seed completed !`);
  }

  private async seedAdmin(): Promise<void> {
    // If the admin already exists, return
    const adminExists = await this.db.prisma.account.findUnique({
      where: {
        email: 'contact@lunisoft.fr',
        role: 'ADMIN',
      },
    });

    if (adminExists) {
      return;
    }

    const hashedPassword = await this.authService.hashPassword({
      password: 'password',
    });

    await this.db.prisma.admin.create({
      data: {
        account: {
          create: {
            role: 'ADMIN',
            email: 'contact@lunisoft.fr',
            password: hashedPassword,
          },
        },
      },
    });
  }

  private async seedCustomer(): Promise<void> {
    // If the admin already exists, return
    const customerExists = await this.db.prisma.account.findUnique({
      where: {
        email: 'customer@lunisoft.fr',
        role: 'CUSTOMER',
      },
    });

    if (customerExists) {
      return;
    }

    const hashedPassword = await this.authService.hashPassword({
      password: 'password',
    });

    await this.db.prisma.customer.create({
      data: {
        account: {
          create: {
            role: 'CUSTOMER',
            email: 'customer@lunisoft.fr',
            password: hashedPassword,
          },
        },
      },
    });
  }

  getTestCredentials(): void {
    this.logger.debug('\n=== Test User Credentials ===');
    this.logger.debug('Admin Account:');
    this.logger.debug('  Email: contact@lunisoft.fr');
    this.logger.debug('  Password: password');
    this.logger.debug('\nCustomer Accounts:');
    this.logger.debug('  Email: customer@lunisoft.fr');
    this.logger.debug('  Password: password');
    this.logger.debug('=============================\n');
  }
}
