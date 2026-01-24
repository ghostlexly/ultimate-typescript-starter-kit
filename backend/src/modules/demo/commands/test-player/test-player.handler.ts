import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TestPlayerCommand } from './test-player.command';

@CommandHandler(TestPlayerCommand)
export class TestPlayerHandler implements ICommandHandler<TestPlayerCommand> {
  // eslint-disable-next-line @typescript-eslint/require-await
  async execute(command: TestPlayerCommand) {
    return {
      name: command.name,
      age: command.age,
      person: command.person,
      id: command.id,
    };
  }
}
