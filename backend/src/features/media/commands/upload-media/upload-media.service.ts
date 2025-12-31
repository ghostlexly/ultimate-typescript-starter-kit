import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadMediaCommand } from './upload-media.command';
import { MediaService } from '../../media.service';
import { S3Service } from 'src/features/application/services/s3.service';

export interface UploadMediaResult {
  id: string;
  presignedUrl: string;
  status: string;
}

@CommandHandler(UploadMediaCommand)
export class UploadMediaService
  implements ICommandHandler<UploadMediaCommand, UploadMediaResult>
{
  constructor(
    private readonly mediaService: MediaService,
    private readonly s3Service: S3Service,
  ) {}

  async execute(command: UploadMediaCommand): Promise<UploadMediaResult> {
    const { file } = command;

    // Verify the file
    await this.mediaService.verifyMulterMaxSizeAndMimeType({
      file: file,
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
      ],
      maxFileSize: 50,
    });

    // Upload the file to S3
    const media = await this.mediaService.uploadFileToS3({
      filePath: file.path,
      originalFileName: file.originalname,
    });

    // Get the presigned url for the file
    const presignedUrl = await this.s3Service.getPresignedUrl({
      key: media.key,
    });

    return {
      id: media.id,
      presignedUrl,
      status: 'success',
    };
  }
}
