import {
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { FilesService } from 'src/modules/shared/services/files.service';
import { S3Service } from '../shared/services/s3.service';

@Injectable()
export class MediaService {
  constructor(
    private db: DatabaseService,
    private filesService: FilesService,
    private s3Service: S3Service,
  ) {}

  /**
   * Save a file uploaded with Multer to S3 and create a media record.
   *
   * @param filePath The path to the file
   * @param originalFileName The original file name
   * @returns The media record
   */
  uploadFileToS3 = async ({
    filePath,
    originalFileName,
  }: {
    filePath: string;
    originalFileName: string;
  }) => {
    const fileInfos = await this.filesService.getFileInfos({
      filePath,
      originalFileName,
    });

    // -- Save the file to S3
    const key = await this.s3Service.upload({
      filePath: filePath,
      fileName: originalFileName,
      mimeType: fileInfos.mimeType,
    });

    return this.db.prisma.media.create({
      data: {
        key: key,
        fileName: originalFileName,
        mimeType: fileInfos.mimeType,
        size: fileInfos.size,
      },
    });
  };

  /**
   * Verify that the file has the correct size and type.
   * Throws an exception if the file does not meet the requirements.
   *
   * @param file The file to verify
   * @param allowedTypes The allowed MIME types
   * @param maxFileSize The maximum file size in Mb
   */
  verifyMulterMaxSizeAndMimeType = async ({
    file,
    allowedMimeTypes,
    maxFileSize,
  }: {
    file: Express.Multer.File;
    allowedMimeTypes: string[];
    maxFileSize: number;
  }) => {
    const maxFileSizeInBytes = maxFileSize * 1_000_000; // Convert Mb to bytes
    const fileInfos = await this.filesService.getFileInfos({
      filePath: file.path,
      originalFileName: file.originalname,
    });

    if (!allowedMimeTypes.includes(fileInfos.mimeType)) {
      throw new UnsupportedMediaTypeException('This file type is not supported.');
    }

    if (file.size > maxFileSizeInBytes) {
      throw new PayloadTooLargeException(
        `The file size must not exceed ${maxFileSize} Mb.`,
      );
    }

    return true;
  };

  /**
   * Verify that the media in the database entry has the correct size and type.
   * Throws an exception if the media in the database entry does not meet the requirements.
   *
   * @param mediaId The media ID
   * @param allowedMimeTypes The allowed MIME types
   * @param maxFileSize The maximum file size in Mb
   */
  verifyMediaMaxSizeAndMimeType = async ({
    mediaId,
    allowedMimeTypes,
    maxFileSize,
  }: {
    mediaId: string;
    allowedMimeTypes: string[];
    maxFileSize: number;
  }) => {
    const maxFileSizeInBytes = maxFileSize * 1_000_000; // Convert Mb to bytes

    const media = await this.db.prisma.media.findUnique({
      where: {
        id: mediaId,
      },
    });

    if (!media) {
      throw new NotFoundException('Media to verify cannot be found.');
    }

    if (!allowedMimeTypes.includes(media.mimeType)) {
      throw new UnsupportedMediaTypeException('This file type is not allowed.');
    }

    if (media.size > maxFileSizeInBytes) {
      throw new PayloadTooLargeException(
        `The file size must not exceed ${maxFileSize} Mb.`,
      );
    }

    return true;
  };

  async deleteMedia({ id }: { id: string }) {
    const media = await this.db.prisma.media.findUnique({
      where: { id },
    });

    return this.db.prisma.$transaction(async (tx) => {
      const result = await tx.media.delete({
        where: { id },
      });

      if (media) {
        await this.s3Service.deleteFile({ key: media.key });
      }

      return result;
    });
  }
}
