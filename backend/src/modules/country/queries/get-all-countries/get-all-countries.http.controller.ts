import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { AllowAnonymous } from 'src/modules/core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from 'src/modules/core/pipes/zod-validation.pipe';
import {
  type GetAllCountriesRequestDto,
  getAllCountriesRequestSchema,
} from './get-all-countries.request.dto';
import { CountryService } from '../../country.service';

@Controller()
export class GetAllCountriesController {
  constructor(private readonly countryService: CountryService) {}

  @Get('/countries')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(getAllCountriesRequestSchema))
  getCountries(@Query() query: GetAllCountriesRequestDto['query']) {
    return this.countryService.getAllCountries(query.language);
  }
}
