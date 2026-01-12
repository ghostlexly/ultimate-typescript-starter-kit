import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TestPlayerCommand } from './test-player.command';

@CommandHandler(TestPlayerCommand)
export class TestPlayerHandler implements ICommandHandler<TestPlayerCommand> {
  // eslint-disable-next-line @typescript-eslint/require-await
  async execute({ data, query }: TestPlayerCommand) {
    return { data, query };
  }
}
