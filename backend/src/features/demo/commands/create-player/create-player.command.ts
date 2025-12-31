export class CreatePlayerCommand {
  constructor(
    public readonly body: {
      name: string;
      age: number;
      person: { name: string };
    },
    public readonly query: { id?: string },
  ) {}
}
