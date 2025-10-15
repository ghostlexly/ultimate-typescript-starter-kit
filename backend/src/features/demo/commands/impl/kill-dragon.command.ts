import { Command } from "@nestjs/cqrs"

export class KillDragonCommand extends Command<{ dragonId: string, heroId: string, killed: boolean}> {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string,
  ) {
    super();
  }
}