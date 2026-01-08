interface UpdateCustomerInformationsCommandProps {
  accountId: string;
  countryCode: string;
  city: string;
}

export class UpdateCustomerInformationsCommand {
  public readonly accountId: string;
  public readonly countryCode: string;
  public readonly city: string;

  constructor(props: UpdateCustomerInformationsCommandProps) {
    this.accountId = props.accountId;
    this.countryCode = props.countryCode;
    this.city = props.city;
  }
}
