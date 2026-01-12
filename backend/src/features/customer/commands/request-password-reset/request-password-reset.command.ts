import { RequestPasswordResetInput } from './request-password-reset.schema';

interface RequestPasswordResetCommandProps {
  data: RequestPasswordResetInput;
}

export class RequestPasswordResetCommand {
  public readonly data: RequestPasswordResetInput;

  constructor(props: RequestPasswordResetCommandProps) {
    this.data = props.data;
  }
}
