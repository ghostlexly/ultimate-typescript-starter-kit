import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { ZodObject, ZodType } from 'zod';
import { ValidationException } from '../exceptions/validation.exception';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: any, metadata: ArgumentMetadata) {
    // If not body or query, return as-is (prevent validation of params)
    if (
      metadata.type !== 'body' &&
      metadata.type !== 'query' &&
      metadata.type !== 'param'
    ) {
      return value;
    }

    if (this.schema instanceof ZodObject) {
      // Extract the appropriate sub-schema based on metadata type
      let schemaToUse = this.schema;
      const shape = this.schema.shape;

      // If schema has a 'body' property and we're validating body, use that sub-schema
      if (metadata.type === 'body') {
        if (shape.body) {
          schemaToUse = shape.body;
        } else {
          return value;
        }
      }

      // If schema has a 'query' property and we're validating query, use that sub-schema
      if (metadata.type === 'query') {
        if (shape.query) {
          schemaToUse = shape.query;
        } else {
          return value;
        }
      }

      // If schema has a 'param' property and we're validating param, use that sub-schema
      if (metadata.type === 'param') {
        if (shape.param) {
          schemaToUse = shape.param;
        } else {
          return value;
        }
      }

      const validation = schemaToUse.safeParse(value);

      if (!validation.success) {
        throw new ValidationException({
          message: validation.error.issues[0].message,
          violations: validation.error.issues.map((e) => ({
            code: e.code,
            message: e.message,
            path: e.path.join('.'),
            metadataType: metadata.type,
            origin: 'ZodValidationPipe',
          })),
          cause: validation.error,
        });
      }

      return validation.data;
    }

    return value;
  }
}
