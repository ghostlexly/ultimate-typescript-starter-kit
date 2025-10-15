import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { KillDragonCommand } from '../impl/kill-dragon.command';

@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  async execute(command: KillDragonCommand) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { dragonId: command.dragonId, heroId: command.heroId, killed: true }
  }
}