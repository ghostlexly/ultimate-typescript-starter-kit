import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { CountryService } from 'src/modules/country/country.service';

@Injectable()
export class UpdateCustomerInformationsHandler {
  constructor(
    private readonly db: DatabaseService,
    private readonly countryService: CountryService,
  ) {}

  async execute({ accountId, countryCode }: { accountId: string; countryCode: string }) {
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
