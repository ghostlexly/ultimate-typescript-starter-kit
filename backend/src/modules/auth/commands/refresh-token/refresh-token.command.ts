export class RefreshTokenCommand {
  public readonly refreshToken: string;

  constructor(props: { refreshToken: string }) {
    this.refreshToken = props.refreshToken;
  }
}
