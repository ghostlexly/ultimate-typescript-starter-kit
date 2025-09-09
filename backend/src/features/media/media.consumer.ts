import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DatabaseService } from 'src/common/services/database.service';
import { FfmpegService } from 'src/common/services/ffmpeg.service';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { S3Service } from 'src/common/services/s3.service';

@Processor('media')
export class MediaConsumer extends WorkerHost {
  private readonly logger = new Logger(MediaConsumer.name);

  constructor(
    private db: DatabaseService,
    private ffmpegService: FfmpegService,
    private s3Service: S3Service,
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

    // Get media
    const media = await this.db.prisma.media.findFirst({
      where: { id: mediaId },
    });

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

    const newKey = await this.s3Service.upload({
      filePath: destVideoFilePath,
      fileName: fileNameMp4,
      mimeType: 'video/mp4',
    });

    // Update the media record with the new file key
    await this.db.prisma.media.update({
      where: { id: mediaId },
      data: { key: newKey, mimeType: 'video/mp4', fileName: fileNameMp4 },
    });

    // Delete the previous file from S3
    await this.s3Service.deleteFile({ key: media.key });

    this.logger.log(
      `Optimized video file ${mediaId} uploaded to S3 as ${newKey} successfully.`,
    );
  }
}
