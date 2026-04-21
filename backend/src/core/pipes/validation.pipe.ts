import { ValidationPipe, ValidationError } from '@nestjs/common';
import { ValidationException } from '../exceptions/validation.exception';

interface Violation {
  code: string;
  message: string;
  path: string;
  origin: 'ClassValidatorPipe';
}

const flattenValidationErrors = (
  errors: ValidationError[],
  parentPath = '',
): Violation[] => {
  const violations: Violation[] = [];

  errors.forEach((error) => {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;

    if (error.constraints) {
      Object.entries(error.constraints).forEach(([code, message]) => {
        violations.push({
          code,
          message,
          path,
          origin: 'ClassValidatorPipe',
        });
      });
    }

    if (error.children && error.children.length > 0) {
      violations.push(...flattenValidationErrors(error.children, path));
    }
  });

  return violations;
};

/**
 * Global validation pipe backed by class-validator and class-transformer.
 * Converts plain request payloads into DTO instances, validates them, and
 * throws a ValidationException that matches the project's error envelope.
 */
export class ClassValidatorPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors: ValidationError[]) => {
        const violations = flattenValidationErrors(errors);

        return new ValidationException({
          message: violations[0]?.message ?? 'Validation failed.',
          violations,
        });
      },
    });
  }
}
