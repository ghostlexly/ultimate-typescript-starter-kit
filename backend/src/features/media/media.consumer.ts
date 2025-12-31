import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { FfmpegService } from 'src/features/application/services/ffmpeg.service';
import { S3Service } from '../application/services/s3.service';
import { MEDIA_REPOSITORY } from './domain/ports';
import type { MediaRepositoryPort } from './domain/ports';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

@Processor('media')
export class MediaConsumer extends WorkerHost {
  private logger = new Logger(MediaConsumer.name);

  constructor(
    @Inject(MEDIA_REPOSITORY)
    private readonly mediaRepository: MediaRepositoryPort,
    private readonly ffmpegService: FfmpegService,
    private readonly s3Service: S3Service,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'optimizeVideo':
        await this.optimizeVideo(job);
        break;
    }
  }

  async optimizeVideo(job: Job<any, any, string>): Promise<any> {
    const { mediaId } = job.data;

    // Get media using repository
    const media = await this.mediaRepository.findById(mediaId);

    if (!media) {
      throw new Error(`Media ${mediaId} not found.`);
    }

    // Download the video file from S3
    this.logger.log(`Downloading video file ${mediaId}...`);

    const tempVideoFilePath = path.join(
      os.tmpdir(),
      `${crypto.randomUUID()}_${media.fileName}`,
    );

    await this.s3Service.downloadToFile({
      key: media.key,
      destinationPath: tempVideoFilePath,
    });

    // Optimize the video file with ffmpeg
    this.logger.log(`Optimizing video file ${mediaId}...`);

    const fileNameMp4 = media.fileName.replace(/\.[^.]+$/, '.mp4');
    const destVideoFilePath = path.join(
      os.tmpdir(),
      `${crypto.randomUUID()}_${fileNameMp4}`,
    );

    await this.ffmpegService.processVideoEncoding({
      inputFilePath: tempVideoFilePath,
      outputFilePath: destVideoFilePath,
    });

    // Upload the optimized video file to S3
    this.logger.log(`Uploading optimized video file ${mediaId}...`);

    const previousKey = media.key;

    const newKey = await this.s3Service.upload({
      filePath: destVideoFilePath,
      fileName: fileNameMp4,
      mimeType: 'video/mp4',
    });

    // Update media entity with new file info
    media.updateFileInfo({
      key: newKey,
      fileName: fileNameMp4,
      mimeType: 'video/mp4',
    });

    // Persist changes using repository
    await this.mediaRepository.update(media);

    // Delete the previous file from S3
    await this.s3Service.deleteFile({ key: previousKey });

    this.logger.log(
      `Optimized video file ${mediaId} uploaded to S3 as ${newKey} successfully.`,
    );
  }
}
