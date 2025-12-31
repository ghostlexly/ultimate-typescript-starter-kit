import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { KillDragonCommand } from './kill-dragon.command';

export interface KillDragonResult {
  dragonId: string;
  heroId: string;
  killed: boolean;
}

@CommandHandler(KillDragonCommand)
export class KillDragonService
  implements ICommandHandler<KillDragonCommand, KillDragonResult>
{
  async execute(command: KillDragonCommand): Promise<KillDragonResult> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      dragonId: command.dragonId,
      heroId: command.heroId,
      killed: true,
    };
  }
}
