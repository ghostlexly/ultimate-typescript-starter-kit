import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { GetCitiesQuery } from './get-cities.query';
import {
  demoGetCitiesSchema,
  type DemoGetCitiesDto,
} from './get-cities.request.dto';

@Controller()
export class GetCitiesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/demos/cities')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(demoGetCitiesSchema))
  async getCities(@Query() query: DemoGetCitiesDto['query']) {
    return this.queryBus.execute(new GetCitiesQuery({ query }));
  }
}
