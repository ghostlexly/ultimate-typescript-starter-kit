import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MediaConsumer } from './media.consumer';
import { DeleteOrphanMediasCron } from './crons/delete-orphan-medias.cron';
import { UploadMediaHttpController } from './commands/upload-media/upload-media.http.controller';
import { UploadMediaService } from './commands/upload-media/upload-media.service';
import { UploadVideoHttpController } from './commands/upload-video/upload-video.http.controller';
import { UploadVideoService } from './commands/upload-video/upload-video.service';
import { MEDIA_REPOSITORY } from './domain/ports';
import { MediaRepository } from './infrastructure/adapters';

const CommandHandlers = [UploadMediaService, UploadVideoService];

const Crons = [DeleteOrphanMediasCron];

const Repositories = [
  {
    provide: MEDIA_REPOSITORY,
    useClass: MediaRepository,
  },
];

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'media',
    }),
  ],
  controllers: [UploadMediaHttpController, UploadVideoHttpController],
  providers: [
    MediaConsumer,
    ...CommandHandlers,
    ...Crons,
    ...Repositories,
  ],
})
export class MediaModule {}
