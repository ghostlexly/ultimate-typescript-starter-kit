import { BadRequestException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { GetCustomerInformationsCommand } from './get-customer-informations.command';

@CommandHandler(GetCustomerInformationsCommand)
export class GetCustomerInformationsHandler
  implements ICommandHandler<GetCustomerInformationsCommand>
{
  constructor(private readonly db: DatabaseService) {}

  async execute({ accountId }: GetCustomerInformationsCommand) {
    const customerInformations = await this.db.prisma.customer.findFirst({
      where: {
        accountId: accountId,
      },
    });

    if (!customerInformations) {
      throw new BadRequestException("You don't have any information.");
    }

    return {
      countryCode: customerInformations.countryCode,
    };
  }
}
