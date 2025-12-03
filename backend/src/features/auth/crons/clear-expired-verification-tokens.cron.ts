import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from 'src/features/application/services/database.service';

@Injectable()
export class ClearExpiredVerificationTokensCron {
  private logger = new Logger(ClearExpiredVerificationTokensCron.name);

  constructor(private db: DatabaseService) {}

  @Cron('0 0 * * * *') // Every hour
  async execute() {
    this.logger.log('[⏰ CRON] Clear expired verification tokens cron started');

    try {
      // Get all expired verification tokens
      const expiredVerificationTokens =
        await this.db.prisma.verificationToken.deleteMany({
          where: {
            expiresAt: { lt: new Date() },
          },
        });

      this.logger.log(
        `[CRON] ${expiredVerificationTokens.count} expired verification tokens cleared`,
      );
    } catch (error) {
      this.logger.error(
        'Error during expired verification tokens clearing:',
        error,
      );
    } finally {
      this.logger.log(
        '[⏰ CRON] Clear expired verification tokens cron finished',
      );
    }
  }
}
