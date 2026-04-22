import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  StorageClass,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createReadStream, createWriteStream } from 'node:fs';
import path from 'node:path';
import { ConfigService } from '@nestjs/config';
import { FilesService } from './files.service';
import { dateUtils } from 'src/core/utils/date';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class S3Service {
  constructor(
    private readonly configService: ConfigService,
    private readonly filesService: FilesService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.client = new S3Client({
      endpoint: this.configService.getOrThrow('APP_S3_ENDPOINT'),
      region: 'auto', // [ex for AWS: eu-west-3] [ex for Cloudflare: auto]
      credentials: {
        accessKeyId: this.configService.getOrThrow('APP_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow('APP_S3_SECRET_KEY'),
      },
    });

    this.bucketName = this.configService.getOrThrow('APP_S3_BUCKET');
  }

  private readonly client: S3Client;

  private readonly bucketName: string;

  /**
   * Save a file to S3 bucket and create a record in the database
   *
   * @param filePath The path to the file
   * @param fileName The name of the file to store in S3
   * @param mimeType The MIME type of the file
   * @param storageClass The storage class of the file in S3. [STANDARD_IA] (Standard Infrequent Access) is 2x cheaper than STANDARD for still good performance || [STANDARD] is the default for frequent access
   *
   * @returns The key in S3
   */
  upload = async ({
    filePath,
    fileName,
    mimeType,
    storageClass = 'STANDARD',
  }: {
    filePath: string;
    fileName: string;
    mimeType: string;
    storageClass?: StorageClass;
  }) => {
    const normalizedFileName = this.filesService.getNormalizedFileName(fileName);

    const key = path.join(
      dateUtils.format(new Date(), 'yyyy'),
      dateUtils.format(new Date(), 'MM'),
      dateUtils.format(new Date(), 'dd'),
      normalizedFileName,
    );

    // Stream the file to S3 via multipart upload to avoid loading
    // the entire payload into memory (and to keep the event loop free
    // of large synchronous checksum hashing on big buffers).
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucketName,
        Key: key,
        Body: createReadStream(filePath),
        StorageClass: storageClass,
        ContentType: mimeType,
      },
    });

    await upload.done();

    return key;
  };

  /**
   * Download a file from S3 to /tmp directory and return the path
   * @param key The key of the file in S3
   * @param destinationPath The path to save the downloaded file
   * @returns The path to the downloaded file
   */
  downloadToFile = async ({
    key,
    destinationPath,
  }: {
    key: string;
    destinationPath?: string;
  }) => {
    if (!destinationPath) {
      destinationPath = path.join('/tmp', path.basename(key));
    }

    const data = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );

    if (!data.Body) {
      throw new NotFoundException('File not found.');
    }

    const fileWriteStream = createWriteStream(destinationPath);

    const stream = new WritableStream({
      write(chunk) {
        fileWriteStream.write(chunk);
      },
      close() {
        fileWriteStream.close();
      },
      abort(err) {
        const error = err instanceof Error ? err : new Error(String(err));
        fileWriteStream.destroy(error);
        throw error;
      },
    });

    // You cannot await just the pipeTo() because you must wait for
    // both pipeTo AND createWriteStream to finish.
    await new Promise<void>((resolve, reject) => {
      fileWriteStream.on('finish', resolve);
      fileWriteStream.on('error', reject);
      void data.Body?.transformToWebStream().pipeTo(stream);
    });

    return destinationPath;
  };

  /**
   * Download a file from S3 to memory and return the base64 string
   */
  downloadToMemoryBase64 = async ({ key }: { key: string }) => {
    const data = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );

    if (!data.Body) {
      throw new NotFoundException('File not found.');
    }

    const contentType = data.ContentType;
    const streamToString = await data.Body.transformToString('base64');

    return {
      contentType,
      base64: streamToString,
    };
  };

  /**
   * Delete a file from S3 bucket
   */
  deleteFile = async ({ key }: { key: string }) => {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  };

  /**
   * Get a presigned URL to upload a file to a S3 bucket
   */
  getPresignedUploadUrl = async ({
    key,
    storageClass = 'STANDARD',
  }: {
    key: string;
    storageClass?: StorageClass;
  }) => {
    return await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        StorageClass: storageClass,
      }),
      { expiresIn: 3600 }, // 1 hour
    );
  };

  getPresignedUrl = async ({
    key,
    expiresIn = 3600,
    useCache = true,
  }: {
    key: string;
    expiresIn?: number;
    useCache?: boolean;
  }) => {
    if (useCache) {
      const cachedUrl = await this.cacheManager.get<string>(key);
      if (cachedUrl) {
        return cachedUrl;
      }
    }

    const presignedUrl = await getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
      { expiresIn },
    );

    if (useCache) {
      await this.cacheManager.set(key, presignedUrl, expiresIn * 1000);
    }

    return presignedUrl;
  };
}
