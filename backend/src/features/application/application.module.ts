import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './services/database.service';
import { FilesService } from './services/files.service';
import { S3Service } from './services/s3.service';
import { PdfService } from './services/pdf.service';
import { FfmpegService } from './services/ffmpeg.service';
import { BrevoService } from './services/brevo.service';

@Global()
@Module({
  providers: [
    DatabaseService,
    FilesService,
    S3Service,
    PdfService,
    FfmpegService,
    BrevoService,
  ],
  exports: [
    DatabaseService,
    FilesService,
    S3Service,
    PdfService,
    FfmpegService,
    BrevoService,
  ],
})
export class ApplicationModule {}
