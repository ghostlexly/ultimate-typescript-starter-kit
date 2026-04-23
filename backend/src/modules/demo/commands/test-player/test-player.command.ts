import { Command } from '@nestjs/cqrs';

export interface TestPlayerCommandResult {
  name: string;
  age: number;
  person: { name: string };
  id?: string;
}

export class TestPlayerCommand extends Command<TestPlayerCommandResult> {
  constructor(
    public readonly name: string,
    public readonly age: number,
    public readonly person: { name: string },
    public readonly id?: string,
  ) {
    super();
  }
}
