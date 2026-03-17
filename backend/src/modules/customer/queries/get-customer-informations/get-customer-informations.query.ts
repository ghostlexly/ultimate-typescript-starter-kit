interface GetCustomerInformationsQueryProps {
  accountId: string;
}

export class GetCustomerInformationsQuery {
  public readonly accountId: string;

  constructor(props: GetCustomerInformationsQueryProps) {
    Object.assign(this, props);
  }
}
