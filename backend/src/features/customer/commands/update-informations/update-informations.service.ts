import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateInformationsCommand } from './update-informations.command';
import { DatabaseService } from 'src/features/application/services/database.service';
import { CountryService } from 'src/features/country/country.service';

export interface UpdateInformationsResult {
  countryCode: string;
  cityId: string;
}

@CommandHandler(UpdateInformationsCommand)
export class UpdateInformationsService
  implements ICommandHandler<UpdateInformationsCommand, UpdateInformationsResult>
{
  constructor(
    private readonly db: DatabaseService,
    private readonly countryService: CountryService,
  ) {}

  async execute(
    command: UpdateInformationsCommand,
  ): Promise<UpdateInformationsResult> {
    const customer = await this.db.prisma.customer.findFirst({
      where: {
        accountId: command.accountId,
      },
    });

    if (!customer) {
      throw new HttpException(
        { message: "You don't have any information" },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if the provided country exists
    const country = this.countryService.getCountryByIso2(command.countryCode);

    if (!country) {
      throw new HttpException(
        { message: "This country doesn't exist" },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if the provided city exists
    const city = await this.db.prisma.city.findUnique({
      where: {
        id: command.cityId,
      },
    });

    if (!city) {
      throw new HttpException(
        { message: "This city doesn't exist" },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.db.prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        countryCode: command.countryCode,
        cityId: command.cityId,
      },
    });

    return {
      countryCode: command.countryCode,
      cityId: command.cityId,
    };
  }
}
