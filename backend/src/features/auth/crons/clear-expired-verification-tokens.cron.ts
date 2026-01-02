import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { VERIFICATION_TOKEN_REPOSITORY } from '../domain/ports';
import type { VerificationTokenRepositoryPort } from '../domain/ports';

@Injectable()
export class ClearExpiredVerificationTokensCron {
  private logger = new Logger(ClearExpiredVerificationTokensCron.name);

  constructor(
    @Inject(VERIFICATION_TOKEN_REPOSITORY)
    private readonly verificationTokenRepository: VerificationTokenRepositoryPort,
  ) {}

  @Cron('0 0 * * * *') // Every hour
  async execute() {
    this.logger.log('[⏰ CRON] Clear expired verification tokens cron started');

    try {
      const count = await this.verificationTokenRepository.deleteExpired();

      this.logger.log(`[CRON] ${count} expired verification tokens cleared`);
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
