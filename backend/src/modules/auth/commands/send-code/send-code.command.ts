import { Command } from '@nestjs/cqrs';

export class SendCodeCommand extends Command<{ message: string }> {
  constructor(public readonly email: string) {
    super();
  }
}
