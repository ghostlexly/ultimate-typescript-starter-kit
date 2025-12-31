export class UpdateInformationsCommand {
  constructor(
    public readonly accountId: string,
    public readonly countryCode: string,
    public readonly cityId: string,
  ) {}
}
