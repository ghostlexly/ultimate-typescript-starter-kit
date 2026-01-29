export interface PasswordResetRequestedEventProps {
  email: string;
  token: string;
}

export class PasswordResetRequestedEvent {
  readonly email: string;
  readonly token: string;

  constructor({ email, token }: PasswordResetRequestedEventProps) {
    this.email = email;
    this.token = token;
  }
}
