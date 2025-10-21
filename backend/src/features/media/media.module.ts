import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaConsumer } from './media.consumer';
import { BullModule } from '@nestjs/bullmq';
import { MediaController } from './controllers/media.controller';
import { DeleteOrphanMediasCron } from './crons/delete-orphan-medias.cron';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'media',
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, MediaConsumer, DeleteOrphanMediasCron],
})
export class MediaModule {}
