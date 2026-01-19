import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TestPlayerCommand } from './test-player.command';

@CommandHandler(TestPlayerCommand)
export class TestPlayerHandler implements ICommandHandler<TestPlayerCommand> {
  // eslint-disable-next-line @typescript-eslint/require-await
  async execute(command: TestPlayerCommand) {
    const { name, age, person, id } = command;
    return { name, age, person, id };
  }
}
