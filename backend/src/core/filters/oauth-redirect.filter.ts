import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import type { Response } from 'express';
import { OAuthRedirectException } from '../exceptions/oauth-redirect.exception';

@Catch(OAuthRedirectException)
export class OAuthRedirectExceptionFilter implements ExceptionFilter {
  catch(exception: OAuthRedirectException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.redirect(`${exception.redirectUrl}?error=${exception.errorCode}`);
  }
}
