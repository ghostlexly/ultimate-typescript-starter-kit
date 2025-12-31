import { InjectQueue } from '@nestjs/bullmq';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Queue } from 'bullmq';
import { UploadVideoCommand } from './upload-video.command';
import { S3Service } from 'src/features/application/services/s3.service';
import { FilesService } from 'src/features/application/services/files.service';
import { Media } from '../../domain/entities';
import { MEDIA_REPOSITORY } from '../../domain/ports';
import type { MediaRepositoryPort } from '../../domain/ports';

export interface UploadVideoResult {
  id: string;
  status: string;
}

@CommandHandler(UploadVideoCommand)
export class UploadVideoService
  implements ICommandHandler<UploadVideoCommand, UploadVideoResult>
{
  private readonly allowedMimeTypes = ['video/mp4', 'video/quicktime'];

  private readonly maxFileSizeInMb = 100;

  constructor(
    @Inject(MEDIA_REPOSITORY)
    private readonly mediaRepository: MediaRepositoryPort,
    private readonly s3Service: S3Service,
    private readonly filesService: FilesService,
    @InjectQueue('media') private readonly mediaQueue: Queue,
  ) {}

  async execute(command: UploadVideoCommand): Promise<UploadVideoResult> {
    const { file } = command;

    // Verify the file
    await this.verifyFile(file);

    // Upload to S3 and create media entity
    const media = await this.uploadToS3(file);

    // Optimize the video file with ffmpeg and reupload it to S3
    await this.mediaQueue.add('optimizeVideo', { mediaId: media.id });

    return {
      id: media.id,
      status: 'success',
    };
  }

  private async verifyFile(file: Express.Multer.File): Promise<void> {
    const maxFileSizeInBytes = this.maxFileSizeInMb * 1_000_000;
    const fileInfos = await this.filesService.getFileInfos({
      filePath: file.path,
      originalFileName: file.originalname,
    });

    if (!this.allowedMimeTypes.includes(fileInfos.mimeType)) {
      throw new HttpException(
        { message: 'This file type is not supported.' },
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      );
    }

    if (file.size > maxFileSizeInBytes) {
      throw new HttpException(
        { message: `The file size must not exceed ${this.maxFileSizeInMb} Mb.` },
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }
  }

  private async uploadToS3(file: Express.Multer.File): Promise<Media> {
    const fileInfos = await this.filesService.getFileInfos({
      filePath: file.path,
      originalFileName: file.originalname,
    });

    const key = await this.s3Service.upload({
      filePath: file.path,
      fileName: file.originalname,
      mimeType: fileInfos.mimeType,
    });

    const media = Media.create({
      id: crypto.randomUUID(),
      key,
      fileName: file.originalname,
      mimeType: fileInfos.mimeType,
      size: fileInfos.size,
    });

    return this.mediaRepository.save(media);
  }
}
