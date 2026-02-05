import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MediaService } from '../../media.service';

@Injectable()
export class UploadVideoHandler {
  constructor(
    private readonly mediaService: MediaService,
    @InjectQueue('media') private readonly mediaQueue: Queue,
  ) {}

  async execute({ file }: { file: Express.Multer.File }) {
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
