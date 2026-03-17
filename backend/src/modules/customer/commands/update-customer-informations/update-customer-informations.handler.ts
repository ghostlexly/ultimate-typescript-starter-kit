import { BadRequestException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { CountryService } from 'src/modules/country/country.service';
import { UpdateCustomerInformationsCommand } from './update-customer-informations.command';

@CommandHandler(UpdateCustomerInformationsCommand)
export class UpdateCustomerInformationsHandler
  implements ICommandHandler<UpdateCustomerInformationsCommand>
{
  constructor(
    private readonly db: DatabaseService,
    private readonly countryService: CountryService,
  ) {}

  async execute({ accountId, countryCode }: UpdateCustomerInformationsCommand) {
    const customerInformations = await this.db.prisma.customer.findFirst({
      where: {
        accountId: accountId,
      },
    });

    if (!customerInformations) {
      throw new BadRequestException("You don't have any information");
    }

    const country = this.countryService.getCountryByIso2(countryCode);

    if (!country) {
      throw new BadRequestException("This country doesn't exist");
    }

    await this.db.prisma.customer.update({
      where: {
        id: customerInformations.id,
      },
      data: {
        countryCode: countryCode,
      },
    });

    return {
      countryCode: countryCode,
    };
  }
}
