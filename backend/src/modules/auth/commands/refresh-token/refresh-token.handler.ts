import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RefreshTokenCommand } from './refresh-token.command';
import { AuthService } from '../../auth.service';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: RefreshTokenCommand) {
    if (!command.refreshToken) {
      throw new HttpException(
        {
          message:
            'Refresh token not found. Please set it in the body parameter or in your cookies.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refreshAuthenticationTokens({
          refreshToken: command.refreshToken,
        });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
