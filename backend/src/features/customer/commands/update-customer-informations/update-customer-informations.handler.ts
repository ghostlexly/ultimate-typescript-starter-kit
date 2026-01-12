import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateCustomerInformationsCommand } from './update-customer-informations.command';
import { DatabaseService } from 'src/features/application/services/database.service';
import { CountryService } from 'src/features/country/country.service';

@CommandHandler(UpdateCustomerInformationsCommand)
export class UpdateCustomerInformationsHandler
  implements ICommandHandler<UpdateCustomerInformationsCommand>
{
  constructor(
    private readonly db: DatabaseService,
    private readonly countryService: CountryService,
  ) {}

  async execute({ accountId, data }: UpdateCustomerInformationsCommand) {
    const customerInformations = await this.db.prisma.customer.findFirst({
      where: {
        accountId,
      },
    });

    if (!customerInformations) {
      throw new HttpException(
        "You don't have any information",
        HttpStatus.BAD_REQUEST,
      );
    }

    const country = this.countryService.getCountryByIso2(data.countryCode);

    if (!country) {
      throw new HttpException(
        "This country doesn't exist",
        HttpStatus.BAD_REQUEST,
      );
    }

    const cityRecord = await this.db.prisma.city.findUnique({
      where: {
        id: data.city,
      },
    });

    if (!cityRecord) {
      throw new HttpException(
        "This city doesn't exist",
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.db.prisma.customer.update({
      where: {
        id: customerInformations.id,
      },
      data: {
        countryCode: data.countryCode,
        cityId: data.city,
      },
    });

    return {
      countryCode: data.countryCode,
      cityId: data.city,
    };
  }
}
