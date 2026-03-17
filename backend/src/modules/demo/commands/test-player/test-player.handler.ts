import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { TestPlayerCommand } from './test-player.command';

@CommandHandler(TestPlayerCommand)
export class TestPlayerHandler implements ICommandHandler<TestPlayerCommand> {
  // eslint-disable-next-line @typescript-eslint/require-await
  async execute({ name, age, person, id }: TestPlayerCommand) {
    return {
      name: name,
      age: age,
      person: person,
      id: id,
    };
  }
}
