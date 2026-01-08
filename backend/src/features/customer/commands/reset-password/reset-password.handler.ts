import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ResetPasswordCommand } from './reset-password.command';
import { DatabaseService } from 'src/features/application/services/database.service';
import { AuthService } from 'src/features/auth/auth.service';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler
  implements ICommandHandler<ResetPasswordCommand>
{
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  async execute({ token, password }: ResetPasswordCommand) {
    const passwordResetToken = await this.db.prisma.verificationToken.findFirst(
      {
        where: {
          type: 'PASSWORD_RESET',
          token,
          expiresAt: {
            gt: new Date(),
          },
          account: {
            role: 'CUSTOMER',
          },
        },
      },
    );

    if (!passwordResetToken) {
      throw new HttpException(
        {
          message:
            "Ce lien de réinitialisation de mot de passe n'est plus valide.",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!passwordResetToken.accountId) {
      throw new HttpException(
        {
          message:
            "Le compte associé à ce lien de réinitialisation n'existe pas.",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await this.authService.hashPassword({
      password,
    });

    await this.db.prisma.account.update({
      where: {
        id: passwordResetToken.accountId,
      },
      data: {
        password: hashedPassword,
      },
    });

    await this.db.prisma.verificationToken.delete({
      where: {
        id: passwordResetToken.id,
      },
    });

    return {
      message: 'Mot de passe réinitialisé avec succès.',
    };
  }
}
