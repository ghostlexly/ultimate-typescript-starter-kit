import { Body, Controller, Post, Query, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/modules/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/modules/core/pipes/zod-validation.pipe';
import { TestPlayerCommand } from './test-player.command';
import {
  testPlayerRequestSchema,
  type TestPlayerRequestDto,
} from './test-player.request.dto';

@Controller()
export class TestPlayerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/demos')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(testPlayerRequestSchema))
  async create(
    @Body() body: TestPlayerRequestDto['body'],
    @Query() query: TestPlayerRequestDto['query'],
  ) {
    return this.commandBus.execute(
      new TestPlayerCommand({ ...body, ...query }),
    );
  }
}
