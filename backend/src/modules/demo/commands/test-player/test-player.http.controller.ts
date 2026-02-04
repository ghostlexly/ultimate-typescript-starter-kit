import { Body, Controller, Post, Query, UsePipes } from '@nestjs/common';
import { AllowAnonymous } from 'src/modules/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/modules/core/pipes/zod-validation.pipe';
import {
  testPlayerRequestSchema,
  type TestPlayerRequestDto,
} from './test-player.request.dto';
import { TestPlayerHandler } from './test-player.handler';

@Controller()
export class TestPlayerController {
  constructor(private readonly handler: TestPlayerHandler) {}

  @Post('/demos')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(testPlayerRequestSchema))
  create(
    @Body() body: TestPlayerRequestDto['body'],
    @Query() query: TestPlayerRequestDto['query'],
  ) {
    return this.handler.execute({ ...body, ...query });
  }
}
