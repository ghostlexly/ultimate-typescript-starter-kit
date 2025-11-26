import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Req,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { type Request } from 'express';
import { Roles } from 'src/core/decorators/roles.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { DatabaseService } from 'src/features/application/services/database.service';
import { CountryService } from 'src/features/country/country.service';
import {
  CustomerCustomerInformationsDto,
  customerCustomerInformationsSchema,
} from '../validators/customer.customer.validators';

@Controller()
@Roles(['CUSTOMER'])
export class CustomerCustomerController {
  constructor(
    private db: DatabaseService,
    private countryService: CountryService,
  ) {}

  @Get('/customer/informations')
  async getCustomerInformations(@Req() req: Request) {
    const customer = req.user?.customer;

    if (!customer) {
      throw new UnauthorizedException();
    }

    const customerInformatons = await this.db.prisma.customer.findFirst({
      include: {
        city: true,
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
      countryCode: customerInformatons.countryCode,
      city: customerInformatons.city,
    };
  }

  @Patch('/customer/informations')
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

    // Check if the provided country exists
    const country = this.countryService.getCountryByIso2(body.countryCode);

    if (!country) {
      throw new HttpException(
        "This country doesn't exist",
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if the provided city exists
    const city = await this.db.prisma.city.findUnique({
      where: {
        id: body.city,
      },
    });

    if (!city) {
      throw new HttpException(
        "This city doesn't exist",
        HttpStatus.BAD_REQUEST,
      );
    }

    const customerInformations = await this.db.prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        countryCode: body.countryCode,
        cityId: body.city,
      },
    });

    return {
      countryCode: customerInformations.countryCode,
      cityId: customerInformations.cityId,
    };
  }
}
