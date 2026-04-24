import { Command } from '@nestjs/cqrs';

export class RefreshTokenCommand extends Command<{
  accessToken: string;
  refreshToken: string;
}> {
  constructor(public readonly refreshToken: string) {
    super();
  }
}
