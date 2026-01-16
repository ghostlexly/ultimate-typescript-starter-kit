import type { Response } from 'express';
import { RefreshTokenInput } from './refresh-token.schema';

interface RefreshTokenCommandProps {
  data: RefreshTokenInput;
  res: Response;
}

export class RefreshTokenCommand {
  public readonly data: RefreshTokenInput;
  public readonly res: Response;

  constructor(props: RefreshTokenCommandProps) {
    this.data = props.data;
    this.res = props.res;
  }
}
