interface RegisterCustomerCommandProps {
  email: string;
  password: string;
}

export class RegisterCustomerCommand {
  public readonly email: string;
  public readonly password: string;

  constructor(props: RegisterCustomerCommandProps) {
    Object.assign(this, props);
  }
}
