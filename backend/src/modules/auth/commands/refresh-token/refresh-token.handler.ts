import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from '../../auth.service';
import { BusinessRuleException } from '../../../core/exceptions/business-rule.exception';

@Injectable()
export class RefreshTokenHandler {
  constructor(private readonly authService: AuthService) {}

  async execute({ refreshToken }: { refreshToken: string }) {
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
      throw new BadRequestException(error.message);
    }
  }
}
