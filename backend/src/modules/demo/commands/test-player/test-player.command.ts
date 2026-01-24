export class TestPlayerCommand {
  public readonly name: string;
  public readonly age: number;
  public readonly person: { name: string };
  public readonly id?: string;

  constructor(props: {
    name: string;
    age: number;
    person: { name: string };
    id?: string;
  }) {
    this.name = props.name;
    this.age = props.age;
    this.person = props.person;
    this.id = props.id;
  }
}
