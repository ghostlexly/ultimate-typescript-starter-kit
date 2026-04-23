import { Command } from '@nestjs/cqrs';

export interface KillDragonCommandResult {
  dragonId: number;
  heroId: number;
  killed: boolean;
}

export class KillDragonCommand extends Command<KillDragonCommandResult> {
  constructor(
    public readonly heroId: number,
    public readonly dragonId: number,
  ) {
    super();
  }
}
