import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  StorageClass,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { configService } from "@/common/services/config.service";
import fs from "fs";
import path from "path";
import { filesService } from "@/common/services/files.service";
import { format } from "date-fns";
import { HttpException } from "@/common/exceptions/http-exception";

class S3Service {
  private client = new S3Client({
    endpoint: configService.getOrThrow("API_S3_ENDPOINT"),
    region: "auto", // [ex for AWS: eu-west-3] [ex for Cloudflare: auto]
    credentials: {
      accessKeyId: configService.getOrThrow("API_S3_ACCESS_KEY"),
      secretAccessKey: configService.getOrThrow("API_S3_SECRET_KEY"),
    },
  });

  private bucketName = configService.getOrThrow("API_S3_BUCKET");

  /**
   * Save a file to S3 bucket and create a record in the database
   *
   * @param filePath The path to the file
   * @param fileName The name of the file to store in S3
   * @param mimeType The MIME type of the file
   * @param storageClass The storage class of the file in S3. [STANDARD_IA] (Standard Infrequent Access) is 2x cheaper than STANDARD for still good performance || [STANDARD] is the default for frequent access
   *
   * @returns The fileKey in S3
   */
  upload = async ({
    filePath,
    fileName,
    mimeType,
    storageClass = "STANDARD_IA",
  }: {
    filePath: string;
    fileName: string;
    mimeType: string;
    storageClass?: StorageClass;
  }) => {
    const buffer = fs.readFileSync(filePath);
    const normalizedFileName = filesService.getNormalizedFileName(fileName);

    const key = path.join(
      format(new Date(), "yyyy"),
      format(new Date(), "MM"),
      format(new Date(), "dd"),
      normalizedFileName
    );

    // -- Save to S3
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        StorageClass: storageClass,
        ContentType: mimeType,
      })
    );

    return key;
  };

  /**
   * Download a file from S3 to /tmp directory and return the path
   * @param params.fileKey The key of the file in S3
   * @param params.destinationPath The path to save the downloaded file
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
      destinationPath = path.join("/tmp", path.basename(key));
    }

    const data = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })
    );

    if (!data.Body) {
      throw HttpException.notFound({
        message: "File not found.",
      });
    }

    const fileWriteStream = fs.createWriteStream(destinationPath);

    const stream = new WritableStream({
      write(chunk) {
        fileWriteStream.write(chunk);
      },
      close() {
        fileWriteStream.close();
      },
      abort(err) {
        fileWriteStream.destroy(err);
        throw err;
      },
    });

    // You cannot await just the pipeTo() because you must wait for
    // both pipeTo AND createWriteStream to finish.
    await new Promise((resolve, reject) => {
      fileWriteStream.on("finish", resolve);
      fileWriteStream.on("error", reject);
      data.Body?.transformToWebStream().pipeTo(stream);
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
      })
    );

    if (!data.Body) {
      throw new HttpException({
        status: 404,
        message: "File not found.",
      });
    }

    const contentType = data.ContentType;
    const streamToString = await data.Body.transformToString("base64");

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
      })
    );
  };

  /**
   * Get a presigned URL to upload a file to a S3 bucket
   */
  getPresignedUploadUrl = async ({
    key,
    storageClass = "STANDARD_IA",
  }: {
    key: string;
    storageClass?: StorageClass;
  }) => {
    const presignedUrl = await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        StorageClass: storageClass,
      }),
      { expiresIn: 3600 } // 1 hour
    );

    return presignedUrl;
  };

  getPresignedUrl = async ({
    key,
    expiresIn = 3600,
  }: {
    key: string;
    expiresIn?: number;
  }) => {
    return await getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
      { expiresIn }
    );
  };
}

export const s3Service = new S3Service();
