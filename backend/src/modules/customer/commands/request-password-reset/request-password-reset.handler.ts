import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RequestPasswordResetCommand } from './request-password-reset.command';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { authConstants } from 'src/modules/auth/auth.constants';
import { dateUtils } from 'src/modules/core/utils/date';

@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler
  implements ICommandHandler<RequestPasswordResetCommand>
{
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  async execute({ email }: RequestPasswordResetCommand) {
    const account = await this.db.prisma.account.findFirst({
      where: {
        role: 'CUSTOMER',
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

    if (!account) {
      throw new HttpException(
        {
          message: "Aucun compte n'est associé à cette adresse e-mail.",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const uniqueToken = this.authService.generateUniqueToken();

    await this.db.prisma.verificationToken.create({
      data: {
        type: 'PASSWORD_RESET',
        token: uniqueToken,
        expiresAt: dateUtils.add(new Date(), {
          hours: authConstants.passwordResetTokenExpirationHours,
        }),
        accountId: account.id,
      },
    });

    return {
      message:
        "Un e-mail a été envoyé à l'adresse e-mail renseignée pour réinitialiser votre mot de passe.",
    };
  }
}
