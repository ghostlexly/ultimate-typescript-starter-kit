import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessRuleException extends HttpException {
  readonly code: string;

  constructor({ message, code }: { message: string; code: string }) {
    super(
      {
        type: 'BusinessRuleException',
        message,
        code,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    this.code = code;
  }
}
