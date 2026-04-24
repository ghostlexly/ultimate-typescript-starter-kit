import { BadRequestException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../../auth.service';
import { BusinessRuleException } from '../../../../core/exceptions/business-rule.exception';
import { RefreshTokenCommand } from './refresh-token.command';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute({ refreshToken }: RefreshTokenCommand) {
    if (!refreshToken) {
      throw new BusinessRuleException({
        message:
          'Refresh token not found. Please set it in the body parameter or in your cookies.',
        code: 'REFRESH_TOKEN_NOT_FOUND',
      });
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refreshAuthenticationTokens({
          refreshToken: refreshToken,
        });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new BadRequestException(message);
    }
  }
}
