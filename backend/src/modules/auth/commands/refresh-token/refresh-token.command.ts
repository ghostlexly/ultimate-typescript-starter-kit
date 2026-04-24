import { Command } from '@nestjs/cqrs';

export class RefreshTokenCommand extends Command<any> {
  constructor(public readonly refreshToken: string) {
    super();
  }
}
