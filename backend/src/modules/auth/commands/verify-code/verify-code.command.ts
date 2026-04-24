import { Command } from '@nestjs/cqrs';

export class VerifyCodeCommand extends Command<any> {
  constructor(
    public readonly email: string,
    public readonly code: string,
  ) {
    super();
  }
}
