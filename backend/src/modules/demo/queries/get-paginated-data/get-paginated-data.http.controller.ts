import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { AllowAnonymous } from 'src/modules/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/modules/core/pipes/zod-validation.pipe';
import {
  demoGetPaginatedDataSchema,
  type DemoGetPaginatedDataDto,
} from './get-paginated-data.request.dto';
import { GetPaginatedDataHandler } from './get-paginated-data.handler';

@Controller()
export class GetPaginatedDataController {
  constructor(private readonly handler: GetPaginatedDataHandler) {}

  @Get('/demos/paginated-data')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(demoGetPaginatedDataSchema))
  async getPaginatedData(@Query() query: DemoGetPaginatedDataDto['query']) {
    return this.handler.execute({ query });
  }
}
