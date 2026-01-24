export class UpdateCustomerInformationsCommand {
  public readonly accountId: string;
  public readonly countryCode: string;
  public readonly cityId: string;

  constructor(props: {
    accountId: string;
    countryCode: string;
    cityId: string;
  }) {
    this.accountId = props.accountId;
    this.countryCode = props.countryCode;
    this.cityId = props.cityId;
  }
}
