import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { AllowAnonymous } from 'src/modules/core/decorators/allow-anonymous.decorator';
import { UploadVideoCommand } from './upload-video.command';

@Controller()
export class UploadVideoController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/media/video')
  @AllowAnonymous()
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
