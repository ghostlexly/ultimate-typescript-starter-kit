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
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import type { RequestUser } from '../../../core/types/request';

@Controller()
@Roles(['CUSTOMER'])
export class CustomerCustomerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Patch('/customer/informations')
  @UsePipes(new ZodValidationPipe(updateCustomerInformationsRequestSchema))
  async updateCustomerInformations(
    @CurrentUser() user: RequestUser,
    @Body() body: UpdateCustomerInformationsRequestDto['body'],
  ) {
    return this.commandBus.execute(
      new UpdateCustomerInformationsCommand({
        accountId: user.accountId,
        countryCode: body.countryCode,
      }),
    );
  }

  @Get('/customer/informations')
  async getCustomerInformations(@CurrentUser() user: RequestUser) {
    return this.queryBus.execute(
      new GetCustomerInformationsQuery({ accountId: user.accountId }),
    );
  }
}
