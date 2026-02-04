import {
  Body,
  Controller,
  Patch,
  Req,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from 'src/modules/core/decorators/roles.decorator';
import { ZodValidationPipe } from 'src/modules/core/pipes/zod-validation.pipe';
import {
  type UpdateCustomerInformationsRequestDto,
  updateCustomerInformationsRequestSchema,
} from './update-customer-informations.request.dto';
import { UpdateCustomerInformationsHandler } from './update-customer-informations.handler';

@Controller()
export class UpdateCustomerInformationsController {
  constructor(private readonly handler: UpdateCustomerInformationsHandler) {}

  @Patch('/customer/informations')
  @Roles(['CUSTOMER'])
  @UsePipes(new ZodValidationPipe(updateCustomerInformationsRequestSchema))
  async updateCustomerInformations(
    @Req() req: Request,
    @Body() body: UpdateCustomerInformationsRequestDto['body'],
  ) {
    const { user } = req;

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.handler.execute({
      accountId: user.accountId,
      countryCode: body.countryCode,
    });
  }
}
