import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { AllowAnonymous } from '../../../core/decorators/allow-anonymous.decorator';
import { UploadMediaCommand } from '../commands/upload-media/upload-media.command';
import { UploadVideoCommand } from '../commands/upload-video/upload-video.command';
import { ValidationException } from '../../../core/exceptions/validation.exception';

@Controller('media')
@AllowAnonymous()
export class MediaController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({}),
      limits: {
        files: 1,
      },
    }),
  )
  async uploadMedia(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new ValidationException({
        message: 'No file uploaded',
        violations: [
          {
            path: 'file',
            message: 'File is required',
          },
        ],
      });
    }

    return this.commandBus.execute(new UploadMediaCommand({ file }));
  }

  @Post('video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({}),
      limits: {
        files: 1,
      },
    }),
  )
  async uploadVideo(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new ValidationException({
        message: 'No file uploaded',
        violations: [
          {
            path: 'file',
            message: 'File is required',
          },
        ],
      });
    }

    return this.commandBus.execute(new UploadVideoCommand({ file: file }));
  }
}
