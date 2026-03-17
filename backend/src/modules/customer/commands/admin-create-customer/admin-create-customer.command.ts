interface AdminCreateCustomerCommandProps {
  email: string;
}

export class AdminCreateCustomerCommand {
  public readonly email: string;

  constructor(props: AdminCreateCustomerCommandProps) {
    Object.assign(this, props);
  }
}
