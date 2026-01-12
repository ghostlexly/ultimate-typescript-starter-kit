import { RegisterCustomerInput } from './register-customer.schema';

interface RegisterCustomerCommandProps {
  data: RegisterCustomerInput;
}

export class RegisterCustomerCommand {
  public readonly data: RegisterCustomerInput;

  constructor(props: RegisterCustomerCommandProps) {
    this.data = props.data;
  }
}
