import type { Response } from 'express';

interface RefreshTokenCommandProps {
  refreshToken: string;
  res: Response;
}

export class RefreshTokenCommand {
  public readonly refreshToken: string;
  public readonly res: Response;

  constructor(props: RefreshTokenCommandProps) {
    this.refreshToken = props.refreshToken;
    this.res = props.res;
  }
}
