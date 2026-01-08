import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { GetPaginatedDataQuery } from './get-paginated-data.query';
import {
  demoGetPaginatedDataSchema,
  type DemoGetPaginatedDataDto,
} from './get-paginated-data.request.dto';

@Controller()
export class GetPaginatedDataController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/demos/paginated-data')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(demoGetPaginatedDataSchema))
  async getPaginatedData(@Query() query: DemoGetPaginatedDataDto['query']) {
    return this.queryBus.execute(new GetPaginatedDataQuery({ query }));
  }
}
