interface GetCustomerInformationsCommandProps {
  accountId: string;
}

export class GetCustomerInformationsCommand {
  public readonly accountId: string;

  constructor(props: GetCustomerInformationsCommandProps) {
    Object.assign(this, props);
  }
}
