export interface LoginCodeRequestedEventProps {
  email: string;
  loginCode: string;
}

export class LoginCodeRequestedEvent {
  readonly email: string;
  readonly loginCode: string;

  constructor({ email, loginCode }: LoginCodeRequestedEventProps) {
    this.email = email;
    this.loginCode = loginCode;
  }
}
