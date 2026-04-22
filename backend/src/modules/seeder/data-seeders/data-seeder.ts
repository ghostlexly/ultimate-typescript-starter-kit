import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService, PrismaTx } from '../../shared/services/database.service';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class DataSeeder {
  private readonly logger = new Logger(DataSeeder.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  public async execute() {
    await this.db.prisma.$transaction(async (tx) => {
      await this.seedAdmin({ tx });
    });

    this.logger.log('Production data seeding complete');
  }

  private async seedAdmin({ tx }: { tx: PrismaTx }): Promise<void> {
    // If the admin already exists, return
    const adminExists = await tx.account.count({
      where: {
        role: 'ADMIN',
      },
    });

    if (adminExists > 0) {
      this.logger.log('Admin account already exists, skipping');
      return;
    }

    const hashedPassword = await this.authService.hashPassword({
      password: 'password',
    });

    await tx.admin.create({
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
}
