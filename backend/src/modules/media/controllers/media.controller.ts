import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { AllowAnonymous } from '../../core/decorators/allow-anonymous.decorator';
import { UploadMediaHandler } from '../commands/upload-media/upload-media.handler';
import { UploadVideoHandler } from '../commands/upload-video/upload-video.handler';

@Controller()
@AllowAnonymous()
export class MediaController {
  constructor(
    private readonly uploadMediaHandler: UploadMediaHandler,
    private readonly uploadVideoHandler: UploadVideoHandler,
  ) {}

  @Post('/media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({}),
      limits: {
        files: 1,
      },
    }),
  )
  async uploadMedia(@UploadedFile() file: Express.Multer.File) {
    return this.uploadMediaHandler.execute({ file });
  }

  @Post('/media/video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({}),
      limits: {
        files: 1,
      },
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return this.uploadVideoHandler.execute({ file });
  }
}
