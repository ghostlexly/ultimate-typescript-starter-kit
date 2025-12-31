export class GetProtectedRouteQuery {
  constructor(
    public readonly sessionId: string,
    public readonly role: string,
    public readonly accountId: string,
    public readonly email: string,
  ) {}
}
