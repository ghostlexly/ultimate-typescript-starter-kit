import { Body, Controller, Post, Query, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { TestPlayerCommand } from './test-player.command';
import {
  demoTestPlayerSchema,
  type DemoTestPlayerDto,
} from './test-player.request.dto';

@Controller()
export class TestPlayerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/demos')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(demoTestPlayerSchema))
  async create(
    @Body() body: DemoTestPlayerDto['body'],
    @Query() query: DemoTestPlayerDto['query'],
  ) {
    return this.commandBus.execute(new TestPlayerCommand({ body, query }));
  }
}
