import { Injectable } from '@nestjs/common';
import { MediaService } from '../../media.service';
import { S3Service } from '../../../shared/services/s3.service';

@Injectable()
export class UploadMediaHandler {
  constructor(
    private readonly mediaService: MediaService,
    private readonly s3Service: S3Service,
  ) {}

  async execute({ file }: { file: Express.Multer.File }) {
    await this.mediaService.verifyMulterMaxSizeAndMimeType({
      file,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'shared/pdf'],
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
