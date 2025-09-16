import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaConsumer } from './media.consumer';
import { BullModule } from '@nestjs/bullmq';
import { MediaCrons } from './media.crons';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'media',
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, MediaConsumer, MediaCrons],
})
export class MediaModule {}
