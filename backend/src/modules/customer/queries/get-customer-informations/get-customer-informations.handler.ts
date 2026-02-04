import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/shared/services/database.service';

@Injectable()
export class GetCustomerInformationsHandler {
  constructor(private readonly db: DatabaseService) {}

  async execute({ accountId }: { accountId: string }) {
    const customerInformations = await this.db.prisma.customer.findFirst({
      where: {
        accountId: accountId,
      },
    });

    if (!customerInformations) {
      throw new HttpException("You don't have any information", HttpStatus.BAD_REQUEST);
    }

    return {
      countryCode: customerInformations.countryCode,
    };
  }
}
