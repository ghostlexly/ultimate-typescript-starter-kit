import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MediaService } from './media.service';
import { MediaConsumer } from './media.consumer';
import { MediaController } from './controllers/media.controller';
import { UploadMediaHandler } from './commands/upload-media/upload-media.handler';
import { UploadVideoHandler } from './commands/upload-video/upload-video.handler';

const CommandHandlers = [UploadMediaHandler, UploadVideoHandler];

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'media',
    }),
  ],
  controllers: [MediaController],
  providers: [...CommandHandlers, MediaService, MediaConsumer],
})
export class MediaModule {}
