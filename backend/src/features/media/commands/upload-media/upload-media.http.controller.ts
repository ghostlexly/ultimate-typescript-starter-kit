import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { UploadMediaCommand } from './upload-media.command';

@Controller()
export class UploadMediaController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/media')
  @AllowAnonymous()
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
}
