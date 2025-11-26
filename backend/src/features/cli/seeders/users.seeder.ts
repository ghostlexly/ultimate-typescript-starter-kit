import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../application/services/database.service';
import { AuthService } from '../../auth/auth.service';

interface TestUser {
  email: string;
  password: string;
  role: 'ADMIN' | 'CUSTOMER';
}

@Injectable()
export class UsersSeeder {
  private readonly logger = new Logger(UsersSeeder.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  async seed(): Promise<void> {
    this.logger.debug('Starting users seed...');

    const testUsers: TestUser[] = [
      {
        email: 'contact@lunisoft.fr',
        password: 'password',
        role: 'ADMIN',
      },
      {
        email: 'customer@lunisoft.fr',
        password: 'password',
        role: 'CUSTOMER',
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const userData of testUsers) {
      try {
        if (userData.role === 'ADMIN') {
          await this.seedAdmin(userData);
        } else {
          await this.seedCustomer(userData);
        }
        created++;
        this.logger.debug(`Created ${userData.role}: ${userData.email}`);
      } catch (error) {
        if (error.code === 'P2002') {
          skipped++;
          this.logger.debug(`Skipped existing user: ${userData.email}`);
        } else {
          this.logger.error(
            `Failed to seed user ${userData.email}: ${error.message}`,
          );
          skipped++;
        }
      }
    }

    this.logger.debug(
      `Users seed completed: ${created} created, ${skipped} skipped`,
    );
  }

  private async seedAdmin(userData: TestUser): Promise<void> {
    const hashedPassword = await this.authService.hashPassword({
      password: userData.password,
    });

    await this.db.prisma.account.create({
      data: {
        role: 'ADMIN',
        email: userData.email,
        password: hashedPassword,
        admin: {
          create: {},
        },
      },
    });
  }

  private async seedCustomer(userData: TestUser): Promise<void> {
    const hashedPassword = await this.authService.hashPassword({
      password: userData.password,
    });

    await this.db.prisma.account.create({
      data: {
        role: 'CUSTOMER',
        email: userData.email,
        password: hashedPassword,
        customer: {
          create: {},
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
