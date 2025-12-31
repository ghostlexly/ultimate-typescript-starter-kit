export class ResetPasswordCommand {
  constructor(
    public readonly email: string,
    public readonly token: string,
    public readonly password: string,
  ) {}
}
