import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SESSION_REPOSITORY } from '../domain/ports';
import type { SessionRepositoryPort } from '../domain/ports';

@Injectable()
export class ClearExpiredSessionsCron {
  private logger = new Logger(ClearExpiredSessionsCron.name);

  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepositoryPort,
  ) {}

  @Cron('0 0 * * * *') // Every hour
  async execute() {
    this.logger.log('[⏰ CRON] Clear expired sessions cron started');

    try {
      const count = await this.sessionRepository.deleteExpired();

      this.logger.log(`[CRON] ${count} expired sessions cleared`);
    } catch (error) {
      this.logger.error('Error during expired sessions clearing:', error);
    } finally {
      this.logger.log('[⏰ CRON] Clear expired sessions cron finished');
    }
  }
}
