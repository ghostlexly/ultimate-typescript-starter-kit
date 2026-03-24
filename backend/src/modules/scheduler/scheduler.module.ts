import { Module } from '@nestjs/common';
import { ClearExpiredSessionsJob } from './jobs/clear-expired-sessions.job';
import { ClearExpiredVerificationTokensJob } from './jobs/clear-expired-verification-tokens.job';
import { ClearOrphanMediasJob } from './jobs/clear-orphan-medias.job';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  providers: [
    ClearExpiredSessionsJob,
    ClearExpiredVerificationTokensJob,
    ClearOrphanMediasJob,
  ],
})
export class SchedulerModule {}
