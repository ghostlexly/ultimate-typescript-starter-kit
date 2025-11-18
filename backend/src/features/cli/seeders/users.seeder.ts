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
    this.logger.log('Starting users seed...');

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
        this.logger.log(`Created ${userData.role}: ${userData.email}`);
      } catch (error) {
        if (error.code === 'P2002') {
          skipped++;
          this.logger.log(`Skipped existing user: ${userData.email}`);
        } else {
          this.logger.error(
            `Failed to seed user ${userData.email}: ${error.message}`,
          );
          skipped++;
        }
      }
    }

    this.logger.log(
      `Users seed completed: ${created} created, ${skipped} skipped`,
    );
  }

  private async seedAdmin(userData: TestUser): Promise<void> {
    const hashedPassword = await this.authService.hashPassword({
      password: userData.password,
    });

    await this.db.prisma.admin.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        account: {
          create: {
            role: 'ADMIN',
          },
        },
      },
    });
  }

  private async seedCustomer(userData: TestUser): Promise<void> {
    const hashedPassword = await this.authService.hashPassword({
      password: userData.password,
    });

    await this.db.prisma.customer.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        account: {
          create: {
            role: 'CUSTOMER',
          },
        },
      },
    });
  }

  getTestCredentials(): void {
    this.logger.log('\n=== Test User Credentials ===');
    this.logger.log('Admin Account:');
    this.logger.log('  Email: contact@lunisoft.fr');
    this.logger.log('  Password: password');
    this.logger.log('\nCustomer Accounts:');
    this.logger.log('  Email: customer@lunisoft.fr');
    this.logger.log('  Password: password');
    this.logger.log('=============================\n');
  }
}
