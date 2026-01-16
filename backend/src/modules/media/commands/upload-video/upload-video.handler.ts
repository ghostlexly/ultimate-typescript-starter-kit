import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UploadVideoCommand } from './upload-video.command';
import { MediaService } from '../../media.service';

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

    await this.mediaQueue.add('optimizeVideo', { mediaId: media.id });

    return {
      status: 'success',
      id: media.id,
    };
  }
}
