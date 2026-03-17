import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { AllowAnonymous } from '../../../core/decorators/allow-anonymous.decorator';
import { UploadMediaCommand } from '../commands/upload-media/upload-media.command';
import { UploadVideoCommand } from '../commands/upload-video/upload-video.command';

@Controller()
@AllowAnonymous()
export class MediaController {
  constructor(private readonly commandBus: CommandBus) {}

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
    return this.commandBus.execute(new UploadMediaCommand({ file }));
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
    return this.commandBus.execute(new UploadVideoCommand({ file }));
  }
}
