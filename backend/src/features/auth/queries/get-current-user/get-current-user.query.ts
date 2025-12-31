export class GetCurrentUserQuery {
  constructor(
    public readonly accountId: string,
    public readonly email: string,
    public readonly role: string,
  ) {}
}
