import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from 'src/modules/shared/services/database.service';

@Injectable()
export class ClearExpiredSessionsJob {
  private logger = new Logger(ClearExpiredSessionsJob.name);

  constructor(private db: DatabaseService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async execute() {
    this.logger.log('[⏰ SCHEDULER]: Running: Clear expired sessions job');

    try {
      // Get all expired sessions
      const expiredSessions = await this.db.prisma.session.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });

      this.logger.log(`${expiredSessions.count} expired sessions cleared`);
    } catch (error) {
      this.logger.error('Error during expired sessions clearing:', error);
    } finally {
      this.logger.log('[⏰ SCHEDULER]: Scheduled clear expired sessions job completed');
    }
  }
}
