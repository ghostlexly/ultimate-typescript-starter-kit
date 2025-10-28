import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  type CustomerRegisterDto,
  customerRegisterSchema,
  type CustomerRequestPasswordResetTokenDto,
  customerRequestPasswordResetTokenSchema,
  type CustomerResetPasswordDto,
} from '../validators/customer.validators';
import { DatabaseService } from 'src/features/application/services/database.service';
import { CustomerService } from '../customer.service';
import { AuthService } from 'src/features/auth/auth.service';
import { dateUtils } from 'src/common/utils/date';
import { authConstants } from 'src/features/auth/auth.constants';
import { Public } from 'src/common/decorators/is-public.decorator';

@Controller()
@Public()
export class CustomerController {
  constructor(
    private db: DatabaseService,
    private customerService: CustomerService,
    private authService: AuthService,
  ) {}

  @Post('/customers/signup')
  @UsePipes(new ZodValidationPipe(customerRegisterSchema))
  async registerCustomer(@Body() body: CustomerRegisterDto) {
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
    return await this.db.prisma.customer.create({
      data: {
        email: body.email,
        password: hashedPassword,
        account: {
          create: {
            role: 'CUSTOMER',
          },
        },
      },
    });
  }

  @Post('/customers/request-password-reset')
  @UsePipes(new ZodValidationPipe(customerRequestPasswordResetTokenSchema))
  async requestPasswordReset(
    @Body() body: CustomerRequestPasswordResetTokenDto,
  ) {
    // Get customer from the given email
    const customer = await this.db.prisma.customer.findFirst({
      where: {
        email: {
          equals: body.email,
          mode: 'insensitive',
        },
      },
    });

    if (!customer) {
      throw new HttpException(
        {
          message: "Aucun compte n'est associé à cette adresse e-mail.",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const uniqueToken = this.authService.generateUniqueToken();

    await this.db.prisma.passwordResetToken.create({
      data: {
        token: uniqueToken,
        expiresAt: dateUtils.add(new Date(), {
          hours: authConstants.passwordResetTokenExpirationHours,
        }),
        customerId: customer.id,
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
  @UsePipes(new ZodValidationPipe(customerRegisterSchema))
  async resetPassword(@Body() body: CustomerResetPasswordDto) {
    // Find the password reset token
    const passwordResetToken =
      await this.db.prisma.passwordResetToken.findFirst({
        where: {
          token: body.token,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

    if (!passwordResetToken) {
      throw new HttpException(
        {
          message:
            "Ce lien de réinitialisation de mot de passe n'est plus valide.",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!passwordResetToken.customerId) {
      throw new HttpException(
        {
          message:
            "Le client associé à ce lien de réinitialisation n'existe pas.",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update the customer's password
    const hashedPassword = await this.authService.hashPassword({
      password: body.password,
    });

    await this.db.prisma.customer.update({
      where: {
        id: passwordResetToken.customerId,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Delete the password reset token
    await this.db.prisma.passwordResetToken.delete({
      where: {
        id: passwordResetToken.id,
      },
    });

    return {
      message: 'Mot de passe réinitialisé avec succès.',
    };
  }
}
