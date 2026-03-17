interface RefreshTokenCommandProps {
  refreshToken: string;
}

export class RefreshTokenCommand {
  public readonly refreshToken: string;

  constructor(props: RefreshTokenCommandProps) {
    Object.assign(this, props);
  }
}
