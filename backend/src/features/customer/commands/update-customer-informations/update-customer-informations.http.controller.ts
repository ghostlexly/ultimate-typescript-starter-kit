import {
  Body,
  Controller,
  Patch,
  Req,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { Roles } from 'src/core/decorators/roles.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { UpdateCustomerInformationsCommand } from './update-customer-informations.command';
import {
  updateCustomerInformationsRequestSchema,
  type UpdateCustomerInformationsRequestDto,
} from './update-customer-informations.request.dto';

@Controller()
export class UpdateCustomerInformationsController {
  constructor(private readonly commandBus: CommandBus) {}

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

    return this.commandBus.execute(
      new UpdateCustomerInformationsCommand({
        accountId: user.accountId,
        countryCode: body.countryCode,
        city: body.city,
      }),
    );
  }
}
