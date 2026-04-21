import { Injectable, Logger } from '@nestjs/common';
import {
  DatabaseService,
  PrismaTransactionClient,
} from '../../shared/services/database.service';
import { AuthService } from '../../auth/auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DevDataSeeder {
  private readonly logger = new Logger(DevDataSeeder.name);
  private readonly NODE_ENV: string;

  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.NODE_ENV = this.configService.getOrThrow<string>('NODE_ENV');
  }

  async execute() {
    if (this.NODE_ENV !== 'development') {
      return;
    }

    await this.db.prisma.$transaction(async (tx) => {
      await this.seedCustomer({ tx });
    });

    this.logger.log('Development data seeding complete');
  }

  private async seedCustomer({ tx }: { tx: PrismaTransactionClient }): Promise<void> {
    // If the admin already exists, return
    const customerExists = await tx.account.count({
      where: {
        role: 'CUSTOMER',
      },
    });

    if (customerExists > 0) {
      this.logger.log('Customer account already exists, skipping');
      return;
    }

    const hashedPassword = await this.authService.hashPassword({
      password: 'password',
    });

    await tx.customer.create({
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
}
