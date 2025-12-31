import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { GetCitiesQuery } from './get-cities.query';
import {
  getCitiesRequestSchema,
  type GetCitiesRequestDto,
} from './get-cities.request.dto';

@Controller()
export class GetCitiesHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/demos/cities')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(getCitiesRequestSchema))
  async getCities(@Query() query: GetCitiesRequestDto['query']) {
    return this.queryBus.execute(new GetCitiesQuery(query));
  }
}
