import { Command } from '@nestjs/cqrs';

export class SendCodeCommand extends Command<any> {
  constructor(public readonly email: string) {
    super();
  }
}
