import { Command } from '@nestjs/cqrs';

export class KillDragonCommand extends Command<{
  dragonId: string;
  heroId: string;
  killed: boolean;
}> {
  constructor(
    public heroId: string,
    public dragonId: string,
  ) {
    super();
  }
}
