interface TestPlayerCommandProps {
  name: string;
  age: number;
  person: { name: string };
  id?: string;
}

export class TestPlayerCommand {
  public readonly name: string;
  public readonly age: number;
  public readonly person: { name: string };
  public readonly id?: string;

  constructor(props: TestPlayerCommandProps) {
    Object.assign(this, props);
  }
}
