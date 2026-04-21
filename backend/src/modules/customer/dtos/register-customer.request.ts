import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class RegisterCustomerRequest {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string;
}
