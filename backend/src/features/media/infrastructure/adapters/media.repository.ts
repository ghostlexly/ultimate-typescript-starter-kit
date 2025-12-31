import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/features/application/services/database.service';
import { Media } from '../../domain/entities';
import { MediaRepositoryPort } from '../../domain/ports';

@Injectable()
export class MediaRepository implements MediaRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  async findById(id: string): Promise<Media | null> {
    const data = await this.db.prisma.media.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return Media.fromPersistence({
      id: data.id,
      fileName: data.fileName,
      key: data.key,
      mimeType: data.mimeType,
      size: data.size,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async save(media: Media): Promise<Media> {
    const data = await this.db.prisma.media.create({
      data: {
        id: media.id,
        fileName: media.fileName,
        key: media.key,
        mimeType: media.mimeType,
        size: media.size,
      },
    });

    return Media.fromPersistence({
      id: data.id,
      fileName: data.fileName,
      key: data.key,
      mimeType: data.mimeType,
      size: data.size,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async update(media: Media): Promise<void> {
    await this.db.prisma.media.update({
      where: { id: media.id },
      data: media.toPersistence(),
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.prisma.media.delete({
      where: { id },
    });
  }
}
