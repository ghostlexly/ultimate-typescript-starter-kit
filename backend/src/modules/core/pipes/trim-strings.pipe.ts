import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimStringsPipe implements PipeTransform<unknown, unknown> {
  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private trimDeep<T>(input: T): T {
    if (typeof input === 'string') {
      return input.trim() as unknown as T;
    }

    if (Array.isArray(input)) {
      const trimmedArray = (input as unknown[]).map((item) =>
        this.trimDeep(item),
      );
      return trimmedArray as unknown as T;
    }

    if (this.isPlainObject(input)) {
      const source = input as Record<string, unknown>;
      const result: Record<string, unknown> = {};
      Object.entries(source).forEach(([key, value]) => {
        if (key === 'password') {
          result[key] = value;
        } else {
          result[key] = this.trimDeep(value);
        }
      });
      return result as unknown as T;
    }

    return input;
  }

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    // If not body, return as-is (prevent trimming of query parameters or params)
    if (metadata.type !== 'body') {
      return value;
    }

    return this.trimDeep(value);
  }
}
