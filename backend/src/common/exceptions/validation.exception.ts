import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor({
    message,
    violations,
    cause,
  }: {
    message: string;
    violations: any[];
    cause?: Error;
  }) {
    super(
      {
        message,
        violations,
        cause:
          process.env.NODE_ENV === 'development' ? cause?.stack : undefined,
      },
      HttpStatus.BAD_REQUEST,
      {
        cause,
      },
    );
  }
}
