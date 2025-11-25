import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UsePipes,
} from '@nestjs/common';
import { Roles } from 'src/core/decorators/roles.decorator';
import { DatabaseService } from 'src/features/application/services/database.service';
import { UnauthorizedException } from '@nestjs/common';
import { type Request } from 'express';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import {
  CustomerCustomerInformationsDto,
  customerCustomerInformationsSchema,
} from '../validators/customer.customer.validators';

@Controller()
@Roles(['CUSTOMER'])
export class CustomerCustomerController {
  constructor(private db: DatabaseService) {}

  @Get('/customer/informations')
  async getCustomerInformations(@Req() req: Request) {
    const customer = req.user?.customer;

    if (!customer) {
      throw new UnauthorizedException();
    }

    const customerInformatons = await this.db.prisma.customer.findFirst({
      include: {
        country: true,
      },
      where: {
        id: customer.id,
      },
    });

    if (!customerInformatons) {
      throw new HttpException(
        "You don't have any information",
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      country: customerInformatons.country,
    };
  }

  @Post('/customer/informations')
  @UsePipes(new ZodValidationPipe(customerCustomerInformationsSchema))
  async saveCustomerInformations(
    @Req() req: Request,
    @Body() body: CustomerCustomerInformationsDto['body'],
  ) {
    const customer = req.user?.customer;

    if (!customer) {
      throw new UnauthorizedException();
    }

    const customerInformatons = await this.db.prisma.customer.findFirst({
      include: {
        country: true,
      },
      where: {
        id: customer.id,
      },
    });

    if (!customerInformatons) {
      throw new HttpException(
        "You don't have any information",
        HttpStatus.BAD_REQUEST,
      );
    }

    const country = await this.db.prisma.country.findFirst({
      where: {
        iso2Code: body.countryCode,
      },
    });

    if (!country) {
      throw new HttpException(
        "This country doesn't exist",
        HttpStatus.BAD_REQUEST,
      );
    }

    const customerInformations = await this.db.prisma.customer.update({
      include: {
        country: true,
      },
      where: {
        id: customer.id,
      },
      data: {
        country: {
          connect: {
            iso2Code: body.countryCode,
          },
        },
      },
    });

    return {
      country: customerInformations.country,
    };
  }
}
