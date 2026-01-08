interface RegisterCustomerCommandProps {
  email: string;
  password: string;
  country: string;
}

export class RegisterCustomerCommand {
  public readonly email: string;
  public readonly password: string;
  public readonly country: string;

  constructor(props: RegisterCustomerCommandProps) {
    this.email = props.email;
    this.password = props.password;
    this.country = props.country;
  }
}
