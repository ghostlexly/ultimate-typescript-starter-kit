import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryController } from './controllers/country.controller';

@Module({
  imports: [],
  controllers: [CountryController],
  providers: [CountryService],
  exports: [CountryService],
})
export class CountryModule {}
