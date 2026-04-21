import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryPublicController } from './controllers/country.public.controller';

@Module({
  imports: [],
  controllers: [CountryPublicController],
  providers: [CountryService],
  exports: [CountryService],
})
export class CountryModule {}
