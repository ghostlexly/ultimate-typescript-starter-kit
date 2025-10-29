import { Module } from '@nestjs/common';
import { CountryController } from './controllers/country.controller';

@Module({
  controllers: [CountryController],
})
export class CountryModule {}
