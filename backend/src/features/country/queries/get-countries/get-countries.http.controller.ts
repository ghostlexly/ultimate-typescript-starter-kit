import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { GetCountriesQuery } from './get-countries.query';
import {
  getCountriesRequestSchema,
  type GetCountriesRequestDto,
} from './get-countries.request.dto';

@Controller()
export class GetCountriesHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/countries')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(getCountriesRequestSchema))
  async getCountries(
    @Query() query: GetCountriesRequestDto['query'],
  ) {
    return this.queryBus.execute(new GetCountriesQuery(query.language));
  }
}
