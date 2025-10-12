import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Public } from 'src/common/decorators/is-public.decorator';
import multer from 'multer';
import { S3Service } from '../application/services/s3.service';

@Controller('media')
export class MediaController {
  constructor(
    private mediaService: MediaService,
    private s3Service: S3Service,
    @InjectQueue('media') private mediaQueue: Queue,
  ) {}

  @Post()
  @Public()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({}),
      limits: {
        files: 1,
      },
    }),
  )
  async uploadMedia(@UploadedFile() file: Express.Multer.File) {
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

  @Post('/video')
  @Public()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({}),
      limits: {
        files: 1,
      },
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
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
      status: 'success',
      id: media.id,
    };
  }
}
