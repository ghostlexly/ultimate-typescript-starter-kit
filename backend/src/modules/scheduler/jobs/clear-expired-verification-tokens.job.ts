import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from 'src/modules/shared/services/database.service';

@Injectable()
export class ClearExpiredVerificationTokensJob {
  private logger = new Logger(ClearExpiredVerificationTokensJob.name);

  constructor(private db: DatabaseService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async execute() {
    this.logger.log('[⏰ SCHEDULER]: Running: Clear expired verification tokens job');

    try {
      // Get all expired verification tokens
      const expiredVerificationTokens = await this.db.prisma.verificationToken.deleteMany(
        {
          where: {
            expiresAt: { lt: new Date() },
          },
        },
      );

      this.logger.log(
        `${expiredVerificationTokens.count} expired verification tokens cleared`,
      );
    } catch (error) {
      this.logger.error('Error during expired verification tokens clearing:', error);
    } finally {
      this.logger.log(
        '[⏰ SCHEDULER]: Scheduled Clear expired verification tokens job completed',
      );
    }
  }
}
