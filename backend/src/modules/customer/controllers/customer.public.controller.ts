import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UpdateCustomerInformationsRequest } from '../dtos/update-customer-informations.request';
import { UpdateCustomerInformationsCommand } from '../commands/update-customer-informations/update-customer-informations.command';
import { GetCustomerInformationsCommand } from '../commands/get-customer-informations/get-customer-informations.command';
import { AuthenticationPrincipal } from '../../../core/decorators/authentication-principal.decorator';
import type { UserPrincipal } from '../../../core/types/request';

@Controller()
@Roles(['CUSTOMER'])
export class CustomerPublicController {
  constructor(private readonly commandBus: CommandBus) {}

  @Patch('/customer/informations')
  async updateCustomerInformations(
    @AuthenticationPrincipal() principal: UserPrincipal,
    @Body() body: UpdateCustomerInformationsRequest,
  ) {
    return this.commandBus.execute(
      new UpdateCustomerInformationsCommand({
        accountId: principal.accountId,
        countryCode: body.countryCode,
      }),
    );
  }

  @Get('/customer/informations')
  async getCustomerInformations(@AuthenticationPrincipal() user: UserPrincipal) {
    return this.commandBus.execute(
      new GetCustomerInformationsCommand({ accountId: user.accountId }),
    );
  }
}
