import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor({ message, violations }: { message: string; violations: any[] }) {
    super(
      {
        type: 'ValidationException',
        message,
        code: 'VALIDATION_ERROR',
        violations,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
