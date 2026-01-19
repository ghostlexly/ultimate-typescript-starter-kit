export class UpdateCustomerInformationsCommand {
  public readonly accountId: string;
  public readonly countryCode: string;
  public readonly city: string;

  constructor(props: { accountId: string; countryCode: string; city: string }) {
    this.accountId = props.accountId;
    this.countryCode = props.countryCode;
    this.city = props.city;
  }
}
