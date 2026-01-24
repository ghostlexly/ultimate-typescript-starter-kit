import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/modules/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/modules/core/pipes/zod-validation.pipe';
import { GetAllCountriesQuery } from './get-all-countries.query';
import {
  type GetAllCountriesRequestDto,
  getAllCountriesRequestSchema,
} from './get-all-countries.request.dto';

@Controller()
export class GetAllCountriesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/countries')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(getAllCountriesRequestSchema))
  async getCountries(@Query() query: GetAllCountriesRequestDto['query']) {
    return this.queryBus.execute(
      new GetAllCountriesQuery({ language: query.language }),
    );
  }
}
