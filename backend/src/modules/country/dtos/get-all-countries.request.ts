import { IsOptional, IsString, Length } from 'class-validator';

export class GetAllCountriesQuery {
  @IsOptional()
  @IsString()
  @Length(2, 5)
  language?: string = 'fr';
}
