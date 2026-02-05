import { UpdateCustomerInformationsHandler } from '../commands/update-customer-informations/update-customer-informations.handler';
import { Roles } from '../../core/decorators/roles.decorator';
import { Body, Controller, Get, Patch, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import {
  type UpdateCustomerInformationsRequestDto,
  updateCustomerInformationsRequestSchema,
} from '../commands/update-customer-informations/update-customer-informations.request.dto';
import { GetCustomerInformationsHandler } from '../queries/get-customer-informations/get-customer-informations.handler';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../../core/types/request';

@Controller()
@Roles(['CUSTOMER'])
export class CustomerCustomerController {
  constructor(
    private readonly updateCustomerInformationsHandler: UpdateCustomerInformationsHandler,
    private readonly getCustomerInformationsHandler: GetCustomerInformationsHandler,
  ) {}

  @Patch('/customer/informations')
  @UsePipes(new ZodValidationPipe(updateCustomerInformationsRequestSchema))
  async updateCustomerInformations(
    @CurrentUser() user: RequestUser,
    @Body() body: UpdateCustomerInformationsRequestDto['body'],
  ) {
    return this.updateCustomerInformationsHandler.execute({
      accountId: user.accountId,
      countryCode: body.countryCode,
    });
  }

  @Get('/customer/informations')
  async getCustomerInformations(@CurrentUser() user: RequestUser) {
    return this.getCustomerInformationsHandler.execute({ accountId: user.accountId });
  }
}
