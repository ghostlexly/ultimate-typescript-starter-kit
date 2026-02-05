import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { AllowAnonymous } from '../../core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import {
  type GetAllCountriesRequestDto,
  getAllCountriesRequestSchema,
} from '../queries/get-all-countries/get-all-countries.request.dto';
import { CountryService } from '../country.service';

@Controller()
@AllowAnonymous()
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get('/countries')
  @UsePipes(new ZodValidationPipe(getAllCountriesRequestSchema))
  getCountries(@Query() query: GetAllCountriesRequestDto['query']) {
    return this.countryService.getAllCountries(query.language);
  }
}
