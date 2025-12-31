import { HttpException, HttpStatus } from '@nestjs/common';
import { Entity, EntityProps } from 'src/core/ddd/domain';

export interface MediaProps extends EntityProps {
  fileName: string;
  key: string;
  mimeType: string;
  size: number;
}

export interface CreateMediaProps {
  id: string;
  fileName: string;
  key: string;
  mimeType: string;
  size: number;
}

/**
 * Media Entity
 *
 * Represents an uploaded media file stored in S3.
 */
export class Media extends Entity<MediaProps> {
  private constructor(props: MediaProps) {
    super(props);
  }

  protected validate(): void {
    if (!this._props.fileName || this._props.fileName.trim() === '') {
      throw new HttpException(
        { message: 'File name is required.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!this._props.key || this._props.key.trim() === '') {
      throw new HttpException(
        { message: 'File key is required.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!this._props.mimeType || this._props.mimeType.trim() === '') {
      throw new HttpException(
        { message: 'MIME type is required.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (this._props.size <= 0) {
      throw new HttpException(
        { message: 'File size must be greater than 0.' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  get fileName(): string {
    return this._props.fileName;
  }

  get key(): string {
    return this._props.key;
  }

  get mimeType(): string {
    return this._props.mimeType;
  }

  get size(): number {
    return this._props.size;
  }

  get sizeInMb(): number {
    return this._props.size / 1_000_000;
  }

  /**
   * Create a new media
   */
  static create(props: CreateMediaProps): Media {
    return new Media({
      id: props.id,
      fileName: props.fileName,
      key: props.key,
      mimeType: props.mimeType,
      size: props.size,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Reconstitute a media from persistence (no validation, no events)
   */
  static fromPersistence(props: MediaProps): Media {
    return new Media(props);
  }

  /**
   * Check if the media has an allowed MIME type
   */
  hasAllowedMimeType(allowedMimeTypes: string[]): boolean {
    return allowedMimeTypes.includes(this._props.mimeType);
  }

  /**
   * Check if the media size is within the limit
   */
  isWithinSizeLimit(maxSizeInMb: number): boolean {
    const maxSizeInBytes = maxSizeInMb * 1_000_000;

    return this._props.size <= maxSizeInBytes;
  }

  /**
   * Update file information after optimization
   */
  updateFileInfo(params: {
    key: string;
    fileName: string;
    mimeType: string;
  }): void {
    this._props.key = params.key;
    this._props.fileName = params.fileName;
    this._props.mimeType = params.mimeType;
    this._props.updatedAt = new Date();
  }

  /**
   * Get data for Prisma update
   */
  toPersistence(): Omit<MediaProps, 'id' | 'createdAt'> {
    return {
      fileName: this._props.fileName,
      key: this._props.key,
      mimeType: this._props.mimeType,
      size: this._props.size,
      updatedAt: new Date(),
    };
  }
}
