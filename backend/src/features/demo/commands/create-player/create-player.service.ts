import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePlayerCommand } from './create-player.command';

@CommandHandler(CreatePlayerCommand)
export class CreatePlayerService
  implements ICommandHandler<CreatePlayerCommand>
{
  execute(command: CreatePlayerCommand) {
    return Promise.resolve({ body: command.body, query: command.query });
  }
}
