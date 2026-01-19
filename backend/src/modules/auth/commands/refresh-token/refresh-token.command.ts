import type { Response } from 'express';

export class RefreshTokenCommand {
  public readonly refreshToken: string;
  public readonly res: Response;

  constructor(props: { refreshToken: string; res: Response }) {
    this.refreshToken = props.refreshToken;
    this.res = props.res;
  }
}
