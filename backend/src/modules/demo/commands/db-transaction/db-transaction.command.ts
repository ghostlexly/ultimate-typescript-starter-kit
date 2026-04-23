import { Command } from '@nestjs/cqrs';

export class DbTransactionCommand extends Command<void> {
  constructor(public readonly name: string) {
    super();
  }
}
