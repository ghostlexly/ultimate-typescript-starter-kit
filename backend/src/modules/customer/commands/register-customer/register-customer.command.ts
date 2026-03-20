interface RegisterCustomerCommandProps {
  email: string;
  country?: string;
}

export class RegisterCustomerCommand {
  public readonly email: string;
  public readonly country?: string;

  constructor(props: RegisterCustomerCommandProps) {
    Object.assign(this, props);
  }
}