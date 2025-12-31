import {
  Body,
  Controller,
  Patch,
  Req,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { type Request } from 'express';
import { Roles } from 'src/core/decorators/roles.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { UpdateInformationsCommand } from './update-informations.command';
import {
  updateInformationsRequestSchema,
  type UpdateInformationsRequestDto,
} from './update-informations.request.dto';

@Controller()
export class UpdateInformationsHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @Patch('/customer/informations')
  @Roles(['CUSTOMER'])
  @UsePipes(new ZodValidationPipe(updateInformationsRequestSchema))
  async updateInformations(
    @Req() req: Request,
    @Body() body: UpdateInformationsRequestDto['body'],
  ) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.commandBus.execute(
      new UpdateInformationsCommand(user.accountId, body.countryCode, body.city),
    );
  }
}
