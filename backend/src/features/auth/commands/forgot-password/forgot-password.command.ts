import { ForgotPasswordInput } from './forgot-password.schema';

interface ForgotPasswordCommandProps {
  data: ForgotPasswordInput;
}

export class ForgotPasswordCommand {
  public readonly data: ForgotPasswordInput;

  constructor(props: ForgotPasswordCommandProps) {
    this.data = props.data;
  }
}
