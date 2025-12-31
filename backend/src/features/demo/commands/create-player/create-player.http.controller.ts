import { Body, Controller, Post, Query, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { CreatePlayerCommand } from './create-player.command';
import {
  createPlayerRequestSchema,
  type CreatePlayerRequestDto,
} from './create-player.request.dto';

@Controller()
export class CreatePlayerHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/demos')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(createPlayerRequestSchema))
  async createPlayer(
    @Body() body: CreatePlayerRequestDto['body'],
    @Query() query: CreatePlayerRequestDto['query'],
  ) {
    return this.commandBus.execute(new CreatePlayerCommand(body, query));
  }
}
