interface KillDragonCommandProps {
  heroId: string;
  dragonId: string;
}

export class KillDragonCommand {
  public readonly heroId: string;
  public readonly dragonId: string;

  constructor(props: KillDragonCommandProps) {
    this.heroId = props.heroId;
    this.dragonId = props.dragonId;
  }
}
