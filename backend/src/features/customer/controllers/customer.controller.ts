import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UsePipes,
} from '@nestjs/common';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { dateUtils } from 'src/core/utils/date';
import { DatabaseService } from 'src/features/application/services/database.service';
import { authConstants } from 'src/features/auth/auth.constants';
import { AuthService } from 'src/features/auth/auth.service';
import { ZodValidationPipe } from '../../../core/pipes/zod-validation.pipe';
import { CustomerService } from '../customer.service';
import {
  type CustomerRegisterDto,
  customerRegisterSchema,
  type CustomerRequestPasswordResetTokenDto,
  customerRequestPasswordResetTokenSchema,
  type CustomerResetPasswordDto,
  customerResetPasswordSchema,
} from '../validators/customer.validators';

@Controller()
@AllowAnonymous()
export class CustomerController {
  constructor(
    private db: DatabaseService,
    private customerService: CustomerService,
    private authService: AuthService,
  ) {}

  @Post('/customers/signup')
  @UsePipes(new ZodValidationPipe(customerRegisterSchema))
  async registerCustomer(@Body() body: CustomerRegisterDto['body']) {
    // verify if this e-mail is already in use
    const existingCustomer = await this.customerService.verifyExistingEmail({
      email: body.email,
    });

    if (existingCustomer) {
      throw new HttpException(
        {
          message: 'Cette adresse e-mail est déjà utilisée.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // hash password
    const hashedPassword = await this.authService.hashPassword({
      password: body.password,
    });

    // create customer
    return await this.db.prisma.account.create({
      data: {
        email: body.email,
        password: hashedPassword,
        role: 'CUSTOMER',
        customer: {
          create: {},
        },
      },
    });
  }

  @Post('/customers/request-password-reset')
  @UsePipes(new ZodValidationPipe(customerRequestPasswordResetTokenSchema))
  async requestPasswordReset(
    @Body() body: CustomerRequestPasswordResetTokenDto['body'],
  ) {
    // Get customer from the given email
    const account = await this.db.prisma.account.findFirst({
      where: {
        role: 'CUSTOMER',
        email: {
          equals: body.email,
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

    // await this.brevoService.sendEmailTemplate({
    //   toEmail: customer.email,
    //   templateId: 275,
    //   subject: 'Demande de réinitialisation de votre mot de passe',
    //   templateParams: {
    //     resetLink: `${this.configService.getOrThrow('APP_BASE_URL')}/customer-area/reset-password?token=${uniqueToken}`,
    //   },
    // });

    return {
      message:
        "Un e-mail a été envoyé à l'adresse e-mail renseignée pour réinitialiser votre mot de passe.",
    };
  }

  @Post('/customers/reset-password')
  @UsePipes(new ZodValidationPipe(customerResetPasswordSchema))
  async resetPassword(
    @Body()
    body: CustomerResetPasswordDto['body'],
  ) {
    // Find the password reset token
    const passwordResetToken = await this.db.prisma.verificationToken.findFirst(
      {
        where: {
          type: 'PASSWORD_RESET',
          token: body.token,
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

    // Update the customer's password
    const hashedPassword = await this.authService.hashPassword({
      password: body.password,
    });

    await this.db.prisma.account.update({
      where: {
        id: passwordResetToken.accountId,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Delete the password reset token
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
