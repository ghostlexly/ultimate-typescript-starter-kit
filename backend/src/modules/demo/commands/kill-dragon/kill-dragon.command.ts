interface KillDragonCommandProps {
  heroId: string;
  dragonId: string;
}

export class KillDragonCommand {
  public readonly heroId: string;
  public readonly dragonId: string;

  constructor(props: KillDragonCommandProps) {
    Object.assign(this, props);
  }
}
