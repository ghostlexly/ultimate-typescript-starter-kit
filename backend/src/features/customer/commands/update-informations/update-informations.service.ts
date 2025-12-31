import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateInformationsCommand } from './update-informations.command';
import { DatabaseService } from 'src/features/application/services/database.service';
import { CountryService } from 'src/features/country/country.service';
import { CountryCode } from '../../domain/value-objects';
import { CUSTOMER_REPOSITORY } from '../../domain/ports';
import type { CustomerRepositoryPort } from '../../domain/ports';

export interface UpdateInformationsResult {
  countryCode: string;
  cityId: string;
}

@CommandHandler(UpdateInformationsCommand)
export class UpdateInformationsService
  implements
    ICommandHandler<UpdateInformationsCommand, UpdateInformationsResult>
{
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
    private readonly db: DatabaseService,
    private readonly countryService: CountryService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    command: UpdateInformationsCommand,
  ): Promise<UpdateInformationsResult> {
    // Validate country code format (Value Object)
    const countryCode = CountryCode.create(command.countryCode);

    // Validate country exists
    const country = this.countryService.getCountryByIso2(countryCode.value);
    if (!country) {
      throw new HttpException(
        { message: "Ce pays n'existe pas." },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Find customer using repository
    const customer = await this.customerRepository.findByAccountId(
      command.accountId,
    );

    if (!customer) {
      throw new HttpException(
        { message: "You don't have any information" },
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

    // Update using entity method (adds domain event if changed)
    customer.updateInformations(countryCode, command.cityId);

    // Persist changes using repository
    await this.customerRepository.save(customer);

    // Dispatch domain events
    for (const event of customer.domainEvents) {
      this.eventEmitter.emit(event.eventName, event);
    }

    return {
      countryCode: customer.countryCode!,
      cityId: customer.cityId!,
    };
  }
}
