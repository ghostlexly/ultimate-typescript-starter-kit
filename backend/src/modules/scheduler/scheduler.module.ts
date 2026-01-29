import { Module } from '@nestjs/common';
import { ClearExpiredSessionsJob } from './jobs/clear-expired-sessions.job';
import { ClearExpiredVerificationTokensJob } from './jobs/clear-expired-verification-tokens.job';
import { ClearOrphanMediasJob } from './jobs/clear-orphan-medias.job';

@Module({
  providers: [
    ClearExpiredSessionsJob,
    ClearExpiredVerificationTokensJob,
    ClearOrphanMediasJob,
  ],
})
export class SchedulerModule {}
