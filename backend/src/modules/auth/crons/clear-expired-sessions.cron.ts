import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from 'src/modules/shared/services/database.service';

@Injectable()
export class ClearExpiredSessionsCron {
  private logger = new Logger(ClearExpiredSessionsCron.name);

  constructor(private db: DatabaseService) {}

  @Cron('0 0 * * * *') // Every hour
  async execute() {
    this.logger.log('[⏰ CRON] Clear expired sessions cron started');

    try {
      // Get all expired sessions
      const expiredSessions = await this.db.prisma.session.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });

      this.logger.log(
        `[CRON] ${expiredSessions.count} expired sessions cleared`,
      );
    } catch (error) {
      this.logger.error('Error during expired sessions clearing:', error);
    } finally {
      this.logger.log('[⏰ CRON] Clear expired sessions cron finished');
    }
  }
}
