import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import type { ArgumentsHost } from '@nestjs/common';

@Catch()
export class UnhandledExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(UnhandledExceptionsFilter.name);

  constructor() {
    super();
  }

  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const httpAdapter = this.httpAdapterHost?.httpAdapter;

    /** If the httpAdapter is not available, let the BaseExceptionFilter handle it */
    if (!httpAdapter) {
      return super.catch(exception, host);
    }

    /** If the exception is an HttpException, let the BaseExceptionFilter handle it */
    if (exception instanceof HttpException) {
      return super.catch(exception, host);
    }

    /** Otherwise, return a 500 error */
    httpAdapter.reply(
      ctx.getResponse(),
      { statusCode: 500, message: 'Internal server error' },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    if (exception instanceof Error) {
      this.logger.error(exception.stack);
    }
  }
}
