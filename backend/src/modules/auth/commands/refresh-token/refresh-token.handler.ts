import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../../auth.service';

@Injectable()
export class RefreshTokenHandler {
  constructor(private readonly authService: AuthService) {}

  async execute({ refreshToken }: { refreshToken: string }) {
    if (!refreshToken) {
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
          refreshToken: refreshToken,
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
