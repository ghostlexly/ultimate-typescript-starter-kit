import { Media } from '../entities';

export const MEDIA_REPOSITORY = Symbol('MEDIA_REPOSITORY');

export interface MediaRepositoryPort {
  findById(id: string): Promise<Media | null>;
  save(media: Media): Promise<Media>;
  update(media: Media): Promise<void>;
  delete(id: string): Promise<void>;
}
