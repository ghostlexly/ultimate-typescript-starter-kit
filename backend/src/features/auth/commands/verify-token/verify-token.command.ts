import { VerifyTokenInput } from './verify-token.schema';

interface VerifyTokenCommandProps {
  data: VerifyTokenInput;
}

export class VerifyTokenCommand {
  public readonly data: VerifyTokenInput;

  constructor(props: VerifyTokenCommandProps) {
    this.data = props.data;
  }
}
