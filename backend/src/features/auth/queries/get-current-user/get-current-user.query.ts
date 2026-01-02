interface GetCurrentUserQueryProps {
  user: Express.User | undefined;
}

export class GetCurrentUserQuery {
  public readonly user: Express.User | undefined;

  constructor(props: GetCurrentUserQueryProps) {
    this.user = props.user;
  }
}
