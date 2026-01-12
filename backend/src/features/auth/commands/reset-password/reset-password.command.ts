import { ResetPasswordInput } from './reset-password.schema';

interface ResetPasswordCommandProps {
  data: ResetPasswordInput;
}

export class ResetPasswordCommand {
  public readonly data: ResetPasswordInput;

  constructor(props: ResetPasswordCommandProps) {
    this.data = props.data;
  }
}
