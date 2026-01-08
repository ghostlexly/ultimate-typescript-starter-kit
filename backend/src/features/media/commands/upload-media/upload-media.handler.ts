import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadMediaCommand } from './upload-media.command';
import { MediaService } from '../../media.service';
import { S3Service } from 'src/features/application/services/s3.service';

@CommandHandler(UploadMediaCommand)
export class UploadMediaHandler implements ICommandHandler<UploadMediaCommand> {
  constructor(
    private readonly mediaService: MediaService,
    private readonly s3Service: S3Service,
  ) {}

  async execute({ file }: UploadMediaCommand) {
    await this.mediaService.verifyMulterMaxSizeAndMimeType({
      file,
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
      ],
      maxFileSize: 50,
    });

    const media = await this.mediaService.uploadFileToS3({
      filePath: file.path,
      originalFileName: file.originalname,
    });

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
