import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { AuthService } from '../../auth.service';

@Injectable()
export class ResetPasswordHandler {
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  async execute({
    email,
    password,
    token,
  }: {
    email: string;
    password: string;
    token: string;
  }) {
    const tokenValid = await this.authService.verifyVerificationToken({
      type: 'PASSWORD_RESET',
      token: token,
      email: email,
    });

    if (!tokenValid) {
      throw new BadRequestException('This token is not valid or expired.');
    }

    const account = await this.db.prisma.account.findFirst({
      where: {
        email: email,
      },
    });

    if (!account) {
      throw new BadRequestException('Account not found.');
    }

    const hashedPassword = await this.authService.hashPassword({
      password: password,
    });

    // Update the account password
    await this.db.prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Delete the verification token
    await this.db.prisma.verificationToken.deleteMany({
      where: {
        accountId: account.id,
        type: 'PASSWORD_RESET',
      },
    });

    return {
      message: 'Password reset successfully.',
    };
  }
}
