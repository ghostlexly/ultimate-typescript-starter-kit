import { InjectQueue } from '@nestjs/bullmq';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { UploadVideoCommand } from './upload-video.command';
import { MediaService } from '../../media.service';

export interface UploadVideoResult {
  id: string;
  status: string;
}

@CommandHandler(UploadVideoCommand)
export class UploadVideoService
  implements ICommandHandler<UploadVideoCommand, UploadVideoResult>
{
  constructor(
    private readonly mediaService: MediaService,
    @InjectQueue('media') private readonly mediaQueue: Queue,
  ) {}

  async execute(command: UploadVideoCommand): Promise<UploadVideoResult> {
    const { file } = command;

    // Verify the file
    await this.mediaService.verifyMulterMaxSizeAndMimeType({
      file: file,
      allowedMimeTypes: ['video/mp4', 'video/quicktime'],
      maxFileSize: 100,
    });

    // Upload the file to S3
    const media = await this.mediaService.uploadFileToS3({
      filePath: file.path,
      originalFileName: file.originalname,
    });

    // Optimize the video file with ffmpeg and reupload it to S3
    await this.mediaQueue.add('optimizeVideo', { mediaId: media.id });

    return {
      id: media.id,
      status: 'success',
    };
  }
}
