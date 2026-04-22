import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MediaService } from '../../media.service';
import { UploadVideoCommand } from './upload-video.command';

@CommandHandler(UploadVideoCommand)
export class UploadVideoHandler implements ICommandHandler<UploadVideoCommand> {
  constructor(
    private readonly mediaService: MediaService,
    @InjectQueue('media') private readonly mediaQueue: Queue,
  ) {}

  async execute({ file }: UploadVideoCommand) {
    await this.mediaService.verifyMulterMaxSizeAndMimeType({
      file,
      allowedMimeTypes: ['video/mp4', 'video/quicktime'],
      maxFileSize: 100,
    });

    const media = await this.mediaService.uploadFileToS3({
      filePath: file.path,
      originalFileName: file.originalname,
    });

    await this.mediaQueue.add('optimizeVideo', { mediaId: media.id }, { attempts: 3 });

    return {
      status: 'success',
      id: media.id,
    };
  }
}
