import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { VerifyTokenCommand } from './verify-token.command';
import { DatabaseService } from 'src/features/application/services/database.service';

export interface VerifyTokenResult {
  message: string;
}

@CommandHandler(VerifyTokenCommand)
export class VerifyTokenService
  implements ICommandHandler<VerifyTokenCommand, VerifyTokenResult>
{
  constructor(private readonly db: DatabaseService) {}

  async execute(command: VerifyTokenCommand): Promise<VerifyTokenResult> {
    const tokenFound = await this.db.prisma.verificationToken.findFirst({
      where: {
        token: command.token,
        type: command.type,
        account: {
          email: command.email,
        },
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!tokenFound) {
      throw new HttpException(
        { message: 'This token is not valid or has expired.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: 'Token is valid.',
    };
  }
}
