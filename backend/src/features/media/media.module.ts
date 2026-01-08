import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { MediaService } from './media.service';
import { MediaConsumer } from './media.consumer';
import { DeleteOrphanMediasCron } from './crons/delete-orphan-medias.cron';
import { UploadMediaController } from './commands/upload-media/upload-media.http.controller';
import { UploadMediaHandler } from './commands/upload-media/upload-media.handler';
import { UploadVideoController } from './commands/upload-video/upload-video.http.controller';
import { UploadVideoHandler } from './commands/upload-video/upload-video.handler';

const CommandHandlers = [UploadMediaHandler, UploadVideoHandler];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({
      name: 'media',
    }),
  ],
  controllers: [UploadMediaController, UploadVideoController],
  providers: [MediaService, MediaConsumer, DeleteOrphanMediasCron, ...CommandHandlers],
})
export class MediaModule {}
