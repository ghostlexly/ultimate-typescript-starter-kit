import { INestApplicationContext, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { FfmpegService } from 'src/modules/shared/services/ffmpeg.service';
import { S3Service } from 'src/modules/shared/services/s3.service';

export interface OptimizeVideoJobData {
  mediaId: string;
}

const logger = new Logger('OptimizeVideoJob');

export async function optimizeVideoJob(
  job: Job<OptimizeVideoJobData>,
  context: INestApplicationContext,
): Promise<void> {
  try {
    const db = context.get(DatabaseService);
    const ffmpegService = context.get(FfmpegService);
    const s3Service = context.get(S3Service);

    const { mediaId } = job.data;

    const media = await db.prisma.media.findFirst({
      where: { id: mediaId },
    });

    if (!media) {
      logger.error(`Media ${mediaId} not found.`);
      return;
    }

    // -- Download the source file from S3 to a temp path
    logger.warn(`Downloading video file ${mediaId}...`);

    const tempVideoFilePath = path.join(
      os.tmpdir(),
      `${crypto.randomUUID()}_${media.fileName}`,
    );

    await s3Service.downloadToFile({
      key: media.key,
      destinationPath: tempVideoFilePath,
    });

    // -- Encode to web-compatible mp4
    logger.warn(`Optimizing video file ${mediaId}...`);

    const fileNameMp4 = media.fileName.replace(/\.[^.]+$/, '.mp4');
    const destVideoFilePath = path.join(
      os.tmpdir(),
      `${crypto.randomUUID()}_${fileNameMp4}`,
    );

    await ffmpegService.processVideoEncoding({
      inputFilePath: tempVideoFilePath,
      outputFilePath: destVideoFilePath,
    });

    // -- Upload the optimized file back to S3
    logger.warn(`Uploading optimized video file ${mediaId}...`);

    const newKey = await s3Service.upload({
      filePath: destVideoFilePath,
      fileName: fileNameMp4,
      mimeType: 'video/mp4',
    });

    // -- Point the media record at the new object and drop the old one
    await db.prisma.media.update({
      where: { id: mediaId },
      data: { key: newKey, mimeType: 'video/mp4', fileName: fileNameMp4 },
    });

    await s3Service.deleteFile({ key: media.key });

    logger.warn(
      `Optimized video file ${mediaId} uploaded to S3 as ${newKey} successfully.`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    logger.error(`Error optimizing video ${job.data.mediaId}: ${message}`);
  }
}
