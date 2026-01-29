import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MediaService } from './media.service';
import { MediaConsumer } from './media.consumer';
import { UploadMediaController } from './commands/upload-media/upload-media.http.controller';
import { UploadMediaHandler } from './commands/upload-media/upload-media.handler';
import { UploadVideoController } from './commands/upload-video/upload-video.http.controller';
import { UploadVideoHandler } from './commands/upload-video/upload-video.handler';

const CommandHandlers = [UploadMediaHandler, UploadVideoHandler];

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'media',
    }),
  ],
  controllers: [UploadMediaController, UploadVideoController],
  providers: [...CommandHandlers, MediaService, MediaConsumer],
})
export class MediaModule {}
