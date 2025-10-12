import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/features/application/services/database.service';
import { FilesService } from 'src/features/application/services/files.service';
import { S3Service } from '../application/services/s3.service';

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
   * @param params.filePath The path to the file
   * @param params.originalFileName The original file name
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

    const media = await this.db.prisma.media.create({
      data: {
        key: key,
        fileName: originalFileName,
        mimeType: fileInfos.mimeType,
        size: fileInfos.size,
      },
    });

    return media;
  };

  /**
   * Verify that the file has the correct size and type.
   * Throws an exception if the file does not meet the requirements.
   *
   * @param params.file The file to verify
   * @param params.allowedTypes The allowed MIME types
   * @param params.maxFileSize The maximum file size in Mb
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
      throw new HttpException(
        { message: 'This file type is not supported.' },
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      );
    }

    if (file.size > maxFileSizeInBytes) {
      throw new HttpException(
        { message: `The file size must not exceed ${maxFileSize} Mb.` },
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    return true;
  };

  /**
   * Verify that the media has the correct size and type.
   * Throws an exception if the media does not meet the requirements.
   *
   * @param params.mediaId The media ID
   * @param params.allowedMimeTypes The allowed MIME types
   * @param params.maxFileSize The maximum file size in Mb
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
      throw new HttpException(
        { message: 'Media to verify cannot be found.' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (!allowedMimeTypes.includes(media.mimeType)) {
      throw new HttpException(
        { message: 'This file type is not allowed.' },
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      );
    }

    if (media.size > maxFileSizeInBytes) {
      throw new HttpException(
        { message: `The file size must not exceed ${maxFileSize} Mb.` },
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    return true;
  };
}
