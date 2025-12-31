import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MediaService } from './media.service';
import { MediaConsumer } from './media.consumer';
import { DeleteOrphanMediasCron } from './crons/delete-orphan-medias.cron';
import { UploadMediaHttpController } from './commands/upload-media/upload-media.http.controller';
import { UploadMediaService } from './commands/upload-media/upload-media.service';
import { UploadVideoHttpController } from './commands/upload-video/upload-video.http.controller';
import { UploadVideoService } from './commands/upload-video/upload-video.service';

const CommandHandlers = [UploadMediaService, UploadVideoService];

const Crons = [DeleteOrphanMediasCron];

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'media',
    }),
  ],
  controllers: [UploadMediaHttpController, UploadVideoHttpController],
  providers: [MediaService, MediaConsumer, ...CommandHandlers, ...Crons],
})
export class MediaModule {}
