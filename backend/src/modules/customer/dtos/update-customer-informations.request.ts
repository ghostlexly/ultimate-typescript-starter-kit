import { IsString, IsUUID, Length } from 'class-validator';

export class UpdateCustomerInformationsRequest {
  @IsString()
  @Length(2, 2)
  countryCode: string;

  @IsUUID()
  city: string;
}
