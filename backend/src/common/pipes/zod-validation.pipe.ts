import { PipeTransform } from '@nestjs/common';
import { ZodError, ZodType } from 'zod';
import { ValidationException } from '../exceptions/validation.exception';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationException({
          message: error.issues[0].message,
          violations: error.issues.map((e) => ({
            code: e.code,
            message: e.message,
            path: e.path.join('.'),
          })),
          cause: error,
        });
      }

      throw error;
    }
  }
}
