import { HttpException, HttpStatus } from '@nestjs/common';

export class OAuthRedirectException extends HttpException {
  constructor(
    public readonly redirectUrl: string,
    public readonly errorCode: string,
  ) {
    super(
      {
        redirectUrl,
        errorCode,
      },
      HttpStatus.FOUND, // 302 redirect
    );
  }
}
