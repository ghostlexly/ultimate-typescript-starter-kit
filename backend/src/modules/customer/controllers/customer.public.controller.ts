import { Body, Controller, Get, Patch, UsePipes } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Roles } from '../../../core/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../core/pipes/zod-validation.pipe';
import {
  type UpdateCustomerInformationsRequestDto,
  updateCustomerInformationsRequestSchema,
} from '../commands/update-customer-informations/update-customer-informations.request.dto';
import { UpdateCustomerInformationsCommand } from '../commands/update-customer-informations/update-customer-informations.command';
import { GetCustomerInformationsQuery } from '../queries/get-customer-informations/get-customer-informations.query';
import { AuthenticationPrincipal } from '../../../core/decorators/authentication-principal.decorator';
import type { UserPrincipal } from '../../../core/types/request';

@Controller()
@Roles(['CUSTOMER'])
export class CustomerPublicController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Patch('/customer/informations')
  @UsePipes(new ZodValidationPipe(updateCustomerInformationsRequestSchema))
  async updateCustomerInformations(
    @AuthenticationPrincipal() principal: UserPrincipal,
    @Body() body: UpdateCustomerInformationsRequestDto['body'],
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
    return this.queryBus.execute(
      new GetCustomerInformationsQuery({ accountId: user.accountId }),
    );
  }
}
