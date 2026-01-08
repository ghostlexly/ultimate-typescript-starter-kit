interface GetCustomerInformationsQueryProps {
  accountId: string;
}

export class GetCustomerInformationsQuery {
  public readonly accountId: string;

  constructor(props: GetCustomerInformationsQueryProps) {
    this.accountId = props.accountId;
  }
}
