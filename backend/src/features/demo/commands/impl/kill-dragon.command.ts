import { Command } from '@nestjs/cqrs';

export class KillDragonCommand extends Command<{
  dragonId: string;
  heroId: string;
  killed: boolean;
}> {
  heroId: string;
  dragonId: string;

  constructor(data: { heroId: string; dragonId: string }) {
    super();
    Object.assign(this, data);
  }
}
