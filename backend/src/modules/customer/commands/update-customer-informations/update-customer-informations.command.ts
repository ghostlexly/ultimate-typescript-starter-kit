interface UpdateCustomerInformationsCommandProps {
  accountId: string;
  countryCode: string;
}

export class UpdateCustomerInformationsCommand {
  public readonly accountId: string;
  public readonly countryCode: string;

  constructor(props: UpdateCustomerInformationsCommandProps) {
    Object.assign(this, props);
  }
}
