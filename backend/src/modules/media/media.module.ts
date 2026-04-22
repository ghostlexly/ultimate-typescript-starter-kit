import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MediaService } from './media.service';
import { MediaController } from './controllers/media.controller';
import { UploadMediaHandler } from './commands/upload-media/upload-media.handler';
import { UploadVideoHandler } from './commands/upload-video/upload-video.handler';
import { sandboxedProcessors } from '../../core/contexts/jobs.context';
import { join } from 'node:path';

const CommandHandlers = [UploadMediaHandler, UploadVideoHandler];

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'media',
      processors: sandboxedProcessors({
        path: join(__dirname, 'media.processor.js'),
        concurrency: 1,
      }),
    }),
  ],
  controllers: [MediaController],
  providers: [...CommandHandlers, MediaService],
  exports: [MediaService],
})
export class MediaModule {}
